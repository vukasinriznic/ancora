from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.ai import build_system_prompt, generate_title, stream_reply
from ..core.security import get_current_user
from ..database import SessionLocal, get_db
from ..models.chat import Chat, Message
from ..models.user import User
from ..schemas.chat import ChatCreate, ChatDetail, ChatListItem, ChatUpdate, SendMessageRequest

router = APIRouter(prefix="/chats", tags=["chats"])

# Koliko poslednjih poruka šaljemo modelu kao kontekst — drži zahteve brzim/jeftinim
# i za jako duge razgovore (sve poruke i dalje ostaju sačuvane u bazi, ovo je samo za AI poziv).
MAX_HISTORY_MESSAGES = 20


def _get_owned_chat(db: Session, chat_id: str, user_id: str) -> Chat:
    chat = db.get(Chat, chat_id)
    if not chat or chat.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found")
    return chat


def _dedupe_consecutive_roles(messages: list[Message]) -> list[Message]:
    """
    Ako je generisanje AI odgovora ranije otkazalo (npr. rate limit), 'user' poruka
    ostaje sačuvana bez para — dve uzastopne 'user' poruke krše Gemini-jev zahtev za
    strogo naizmeničnim role-ovima (user/model) i obaraju SVAKI naredni poziv u tom
    chatu. Ovde ne menjamo šta je sačuvano (istorija u UI-ju ostaje potpuna) — samo
    biramo šta šaljemo modelu: iz svakog niza uzastopnih poruka istog role-a čuvamo
    samo poslednju.
    """
    deduped: list[Message] = []
    for m in messages:
        if deduped and deduped[-1].role == m.role:
            deduped[-1] = m
        else:
            deduped.append(m)
    return deduped


@router.post("", response_model=ChatDetail, status_code=status.HTTP_201_CREATED)
def create_chat(
    data: ChatCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ChatDetail:
    chat = Chat(
        user_id=current_user.id,
        title=generate_title(data.person_description),
        person_description=data.person_description,
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return ChatDetail.model_validate(chat)


@router.get("", response_model=list[ChatListItem])
def list_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Chat]:
    return list(
        db.scalars(
            select(Chat).where(Chat.user_id == current_user.id).order_by(Chat.updated_at.desc())
        )
    )


@router.get("/{chat_id}", response_model=ChatDetail)
def get_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Chat:
    return _get_owned_chat(db, chat_id, current_user.id)


@router.patch("/{chat_id}", response_model=ChatListItem)
def rename_chat(
    chat_id: str,
    data: ChatUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Chat:
    chat = _get_owned_chat(db, chat_id, current_user.id)
    chat.title = data.title
    db.commit()
    db.refresh(chat)
    return chat


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(chat_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    chat = _get_owned_chat(db, chat_id, current_user.id)
    db.delete(chat)  # cascade briše i poruke (ondelete="CASCADE" na Message.chat_id)
    db.commit()


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: str,
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    chat = _get_owned_chat(db, chat_id, current_user.id)

    db.add(Message(chat_id=chat_id, role="user", content=data.content))
    db.commit()

    all_messages = list(
        db.scalars(select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at))
    )
    clean_messages = _dedupe_consecutive_roles(all_messages)
    history = [
        {"role": m.role, "content": m.content} for m in clean_messages[-MAX_HISTORY_MESSAGES:]
    ]
    system_prompt = build_system_prompt(
        current_user.first_name, current_user.last_name, current_user.description, chat.person_description
    )

    async def generate():
        full_reply = ""
        error_code: str | None = None
        try:
            async for piece in stream_reply(system_prompt, history):
                full_reply += piece
                yield piece
        except Exception as e:  # npr. Gemini 429 / mrežni problem
            msg = str(e)
            error_code = "rate_limit" if ("RESOURCE_EXHAUSTED" in msg or "429" in msg) else "generic"
            # Signal frontendu SAMO ako još nismo poslali pravi tekst (greška obično padne na
            # prvoj iteraciji). Frontend detektuje sentinel i prikaže lokalizovanu poruku.
            if not full_reply:
                yield f"[[ANCORA_ERR:{error_code}]]"

        # Čuvamo AI odgovor samo ako je uspešno generisan (bez greške i neprazan).
        if error_code is None and full_reply.strip():
            with SessionLocal() as s:
                s.add(Message(chat_id=chat_id, role="assistant", content=full_reply))
                saved_chat = s.get(Chat, chat_id)
                if saved_chat:
                    saved_chat.updated_at = datetime.now(timezone.utc)  # eksplicitno → SQLAlchemy vidi promenu
                s.commit()

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")
