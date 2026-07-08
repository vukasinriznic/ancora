# ⚓ Ancora — Wise Relationship Advice, Whenever You Need It

A full-stack AI web application that offers thoughtful, dignified relationship advice — describe your situation and think it through with honesty and compassion. Built with **React**, **FastAPI**, **PostgreSQL** and **Google Gemini**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

---

## 📋 Overview

Ancora is the *"wise friend everyone wants but rarely has"* — an AI advisor that listens without judgment, tells the truth with kindness, and always protects your dignity and self-respect. Create an account, describe a situation, and have a real, streaming conversation that helps you navigate relationships with clarity, fairness and compassion.

---

## ✨ Features

### 🔐 Authentication
- Secure registration with **email verification** over transactional email
- JWT-based authentication with bcrypt password hashing
- **Forgot / reset password** via time-limited email links (1-hour token)
- Protected routes — each user sees only their own conversations

### 💬 AI Chat
- **Real-time streaming** replies powered by Google Gemini
- Every conversation is grounded in your self-description for personalized advice
- AI-generated conversation titles
- Markdown-rendered responses with copy-to-clipboard
- Graceful handling of API rate limits ("Ancora is overloaded, try again in a moment")

### 👤 Profile & Privacy
- Edit your name and the self-description that guides the AI
- Change your password from the settings page
- **GDPR-compliant account deletion** — removes your account and every conversation

### 🌍 Bilingual & Accessible
- Full **English / Serbian** localization
- Polished, animated UI with a custom canvas hero
- Respects `prefers-reduced-motion` for accessibility

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Backend | FastAPI + Python |
| Database | PostgreSQL + SQLAlchemy |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Auth | JWT + bcrypt |
| Email | Brevo (transactional API) |
| i18n | i18next / react-i18next |

---

## 🗄️ Database

Key models:

- `User` — registered users with hashed password, self-description (feeds the AI) and verification status
- `Chat` — a conversation linked to a user, with an AI-generated title and situation context
- `Message` — individual user / assistant messages within a chat (cascade-deleted with the chat)

Tables are created automatically on startup — no migration step required.

---

## 🚀 Getting Started

### Prerequisites
- Python >= 3.11
- Node.js >= 18
- PostgreSQL
- *(Optional)* Google Gemini API key — free at [aistudio.google.com](https://aistudio.google.com/apikey). Without it, the app falls back to mock AI replies.

### Backend Setup
```bash
cd ancora/backend

# Create & activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
```

Create a `.env` file in `ancora/backend/`:
```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ancora
JWT_SECRET=your_random_secret_here
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email — Brevo transactional API (verify a single sender, no domain needed).
# Leave blank to fall back to local SMTP, or to print email links to the console in dev.
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=Ancora <your_verified_sender@gmail.com>

# Google Gemini (optional — leave blank for mock AI replies)
GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_MODEL=gemini-2.5-flash
```
> **Note:** the production backend runs on Render, which blocks outbound SMTP — email is sent via Brevo's HTTPS API. Raw SMTP still works as a local-dev fallback.

Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
API runs on `http://localhost:8000` — interactive docs at [`/docs`](http://localhost:8000/docs).

### Frontend Setup
```bash
cd ancora/frontend
npm install
npm run dev
```
Client runs on `http://localhost:5173`. Optionally set `VITE_API_URL` to point at a non-default backend.

---

## 📁 Project Structure
```
ancora/
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── core/             # security (JWT), email, AI (Gemini)
│   │   ├── models/           # SQLAlchemy models (User, Chat, Message)
│   │   ├── routers/          # auth & chats routes
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── config.py         # settings loaded from .env
│   │   └── main.py           # app entry, CORS, table creation
│   └── requirements.txt
└── frontend/                  # React + Vite frontend
    ├── src/
    │   ├── components/       # ChatShell, ChatSidebar, DiamondCanvas, ...
    │   ├── context/          # Auth context
    │   ├── hooks/            # usePageTitle, usePrefersReducedMotion
    │   ├── lib/              # API client
    │   ├── pages/            # Home, Login, Register, Chat, Settings, ...
    │   └── i18n.ts           # EN / SR translations
    └── package.json
```

---

## 🔗 Live Site

👉 **[ancora-ai.vercel.app](https://ancora-ai.vercel.app)**

> Hosted on free tiers (Vercel · Render · Supabase). The backend may take ~30s to wake on the first request if it has been idle.

---

## 👤 Author

**Vukašin Riznić**
[github.com/vukasinriznic](https://github.com/vukasinriznic)
