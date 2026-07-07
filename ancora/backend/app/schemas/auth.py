from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel

DESCRIPTION_MIN = 40


class CamelModel(BaseModel):
    """Bazni model — prima i šalje camelCase (firstName...), interno snake_case.
    Usklađeno sa poljima na frontendu."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class RegisterRequest(CamelModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8)
    description: str = Field(min_length=DESCRIPTION_MIN)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str


class VerifyRequest(CamelModel):
    token: str


class ResendRequest(CamelModel):
    email: EmailStr


class ForgotPasswordRequest(CamelModel):
    email: EmailStr


class ResetPasswordRequest(CamelModel):
    token: str
    password: str = Field(min_length=8)


class ProfileUpdate(CamelModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=80)
    last_name: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, min_length=DESCRIPTION_MIN)


class ChangePasswordRequest(CamelModel):
    current_password: str
    new_password: str = Field(min_length=8)


class UserOut(CamelModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    description: str
    is_verified: bool


class AuthResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(CamelModel):
    message: str
    email: EmailStr | None = None
