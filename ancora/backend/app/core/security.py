from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.user import User

bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _create_token(subject: str, purpose: str, minutes: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    payload = {"sub": subject, "purpose": purpose, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: str) -> str:
    return _create_token(subject, "access", settings.ACCESS_TOKEN_EXPIRE_MINUTES)


def create_verification_token(subject: str) -> str:
    return _create_token(subject, "verify", settings.VERIFY_TOKEN_EXPIRE_MINUTES)


def create_reset_token(subject: str) -> str:
    return _create_token(subject, "reset", settings.RESET_TOKEN_EXPIRE_MINUTES)


def decode_token(token: str, expected_purpose: str) -> str | None:
    """Vrati subject (user id) ako je token validan i ima očekivani purpose, inače None."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("purpose") != expected_purpose:
        return None
    return payload.get("sub")


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Validira Bearer token i vraća ulogovanog korisnika."""
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_token(creds.credentials, "access")
    if not user_id:
        raise invalid
    user = db.get(User, user_id)
    if not user:
        raise invalid
    return user
