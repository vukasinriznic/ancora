from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .models import user as _user  # noqa: F401 — registruje model za create_all
from .routers import auth

# create_all: napravi tabele ako ne postoje (bez Alembic-a za sada)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ancora API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
