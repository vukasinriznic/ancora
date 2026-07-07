from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.email import send_reset_email, send_verification_email
from ..core.security import (
    create_access_token,
    create_reset_token,
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
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ProfileUpdate,
    RegisterRequest,
    ResendRequest,
    ResetPasswordRequest,
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


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, background: BackgroundTasks, db: Session = Depends(get_db)) -> MessageResponse:
    user = db.scalar(select(User).where(User.email == data.email))
    # Šaljemo samo ako nalog postoji; odgovor je uvek isti (ne otkrivamo da li email postoji)
    if user:
        token = create_reset_token(user.id)
        background.add_task(send_reset_email, user.email, user.first_name, token)
    return MessageResponse(message="reset_sent", email=str(data.email))


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    user_id = decode_token(data.token, "reset")
    if not user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset link")

    user.hashed_password = hash_password(data.password)
    db.commit()
    return MessageResponse(message="password_reset")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserOut)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    # Ažuriramo samo prosleđena polja (partial update)
    fields = data.model_dump(exclude_unset=True)
    if data.first_name is not None:
        current_user.first_name = data.first_name
    if data.last_name is not None:
        current_user.last_name = data.last_name
    if data.description is not None:
        current_user.description = data.description
    if fields:
        db.commit()
        db.refresh(current_user)
    return current_user


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return MessageResponse(message="password_changed")


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    # Cascade na chats/messages briše sve povezane podatke (GDPR — pravo na brisanje)
    db.delete(current_user)
    db.commit()
