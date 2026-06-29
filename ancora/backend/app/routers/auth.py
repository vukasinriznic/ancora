from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.email import send_verification_email
from ..core.security import (
    create_access_token,
    create_verification_token,
    decode_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..models.user import User
from ..schemas.auth import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResendRequest,
    UserOut,
    VerifyRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, background: BackgroundTasks, db: Session = Depends(get_db)) -> MessageResponse:
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=str(data.email),
        hashed_password=hash_password(data.password),
        description=data.description,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Pošalji verifikacioni email u pozadini (ne blokira odgovor)
    token = create_verification_token(user.id)
    background.add_task(send_verification_email, user.email, user.first_name, token)

    return MessageResponse(message="verification_sent", email=str(user.email))


@router.post("/verify", response_model=AuthResponse)
def verify(data: VerifyRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user_id = decode_token(data.token, "verify")
    if not user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired verification link")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired verification link")

    if not user.is_verified:
        user.is_verified = True
        db.commit()
        db.refresh(user)

    # Potvrda = automatski login
    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(data: ResendRequest, background: BackgroundTasks, db: Session = Depends(get_db)) -> MessageResponse:
    user = db.scalar(select(User).where(User.email == data.email))
    # Šaljemo samo ako postoji i nije potvrđen; odgovor je uvek isti (ne otkrivamo da li email postoji)
    if user and not user.is_verified:
        token = create_verification_token(user.id)
        background.add_task(send_verification_email, user.email, user.first_name, token)
    return MessageResponse(message="verification_sent", email=str(data.email))


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == data.email))
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not user.is_verified:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Email not verified")

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
