from datetime import datetime

from pydantic import Field

from .auth import CamelModel

PERSON_DESC_MIN = 10


class ChatCreate(CamelModel):
    # Opis osobe/situacije — kontekst za AI (kao self-description na registraciji)
    person_description: str = Field(min_length=PERSON_DESC_MIN, max_length=4000)


class ChatUpdate(CamelModel):
    title: str = Field(min_length=1, max_length=120)


class MessageOut(CamelModel):
    id: str
    role: str
    content: str
    created_at: datetime


class ChatListItem(CamelModel):
    id: str
    title: str
    updated_at: datetime


class ChatDetail(CamelModel):
    id: str
    title: str
    person_description: str
    created_at: datetime
    messages: list[MessageOut]


class SendMessageRequest(CamelModel):
    content: str = Field(min_length=1, max_length=8000)
