# Ancora — Handoff / Completion Guide

> Za novu sesiju: reci Claude-u **„budi terse, ne ispisuj velike logove ni cele fajlove"** da se tokeni ne troše brzo.
> Radni dir: `C:\CV PROJECTS\aiproject\ancora` (backend/ i frontend/).

## Kako pokrenuti (dev)
- **Backend:** `cd ancora/backend && venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload`
  - Napomena: pozadinski server se u prethodnoj sesiji stalno gasio; ako log ne pokazuje `print`, restartuj proces (`Get-Process python | Stop-Process -Force` pa startuj ponovo).
- **Frontend:** `cd ancora/frontend && npm run dev` (port 5173). Preview tool ume da zamrzne rAF/scroll/clipboard — vizuelne stvari proveravaj u pravom browseru.
- **Baza:** PostgreSQL lokalno, DB `ancora`, `postgres` / `postgres123`.
- **Test nalog:** `riznicvukasin@gmail.com` / `Ancora123!`.
- Secrets su u `ancora/backend/.env` (gitignored): DATABASE_URL, JWT_SECRET, SMTP (Gmail app password), GOOGLE_API_KEY, GOOGLE_MODEL=`gemini-2.5-flash`.

## Status — ŠTA JE GOTOVO
- Landing, auth (register + **email verifikacija** preko Gmail SMTP + login), 404, Privacy/Terms, per-route `<title>`.
- **Chat sistem** (Gemini `gemini-2.5-flash`): sidebar dashboard (`ChatShell`+`ChatSidebar`), lista/nova/soba, streaming, markdown render, copy dugme, pretraga, rename/delete, mobilni drawer.
- **AI naslov chata** iz opisa (`generate_title` u `core/ai.py`) — radi (4–6 reči, u jeziku korisnika).
- **Graciozne chat greške** — backend šalje sentinel `[[ANCORA_ERR:rate_limit|generic]]`, `api.ts streamMessage` ga detektuje i baca `ApiError`, `ChatRoom` prikaže `chat.room.rateLimited`. GOTOVO.
- **Zaboravljena lozinka — DELIMIČNO:**
  - Backend GOTOVO: `POST /auth/forgot-password`, `POST /auth/reset-password`, `create_reset_token` (purpose="reset", 1h, `RESET_TOKEN_EXPIRE_MINUTES`), `send_reset_email` (u `core/email.py`, refaktorisan `_send`/`_button_email`).
  - Frontend GOTOVO: `authApi.forgotPassword/resetPassword` u `lib/api.ts`; i18n (`auth.forgot.*`, `auth.reset.*`, `auth.login.forgot`) EN+SR; stranice `pages/ForgotPassword.tsx` i `pages/ResetPassword.tsx` napravljene.
  - **GOTOVO (2026-07-07):** rute dodate u `App.tsx` pod `AuthShell`, „Forgot password?" link u `Login.tsx` ispod password polja, tsc čist, stranice renderuju kroz preview. Ostaje samo ručni end-to-end test slanja mejla/reset flowa.

## Status — ŠTA JOŠ TREBA (redom)

### 1. Podešavanja profila + brisanje naloga — GOTOVO (2026-07-07)
Backend: `PATCH /auth/me` (ProfileUpdate), `POST /auth/change-password` (ChangePasswordRequest, 400 na pogrešnu trenutnu), `DELETE /auth/me` (204, DB cascade briše chats/messages). Frontend: `authApi.updateProfile/changePassword/deleteAccount`, `AuthContext.updateUser`, `pages/Settings.tsx` (profil + lozinka + danger zone), ruta `/settings` pod ChatShell, zupčanik u `ChatSidebar`, i18n `settings.*` EN+SR. Testirano: PATCH radi (curl + UI save→„Profile updated ✓"), wrong-password→400. Nije ručno okinuto stvarno brisanje/promena lozinke (da se test nalog ne uništi).

<details><summary>Originalni plan (za referencu)</summary>
Korisnik može da menja ime/prezime/opis-o-sebi (opis hrani AI) i lozinku.
- **Backend** (`routers/auth.py` + `schemas/auth.py`):
  - `PATCH /auth/me` (zaštićeno `get_current_user`): body `{firstName?, lastName?, description?}` → update polja, vrati `UserOut`. Dodaj `ProfileUpdate(CamelModel)` sa opcionim poljima (`first_name: str|None`, `last_name`, `description` min 40).
  - `POST /auth/change-password` (zaštićeno): `{currentPassword, newPassword(min8)}` → proveri `verify_password(current, user.hashed_password)`, inače 400; postavi novi hash. Dodaj `ChangePasswordRequest`.
- **Frontend:**
  - `authApi.updateProfile(payload)` (PATCH /auth/me, auth) i `authApi.changePassword(current,new)` u `lib/api.ts`.
  - U `AuthContext` dodaj način da se `user` osveži posle update-a (npr. `setUser` iz rezultata; možda izloži `refreshUser`/`updateUser`).
  - Nova stranica `pages/Settings.tsx` (bela tema kao chat, koristi obične inpute kao `NewChat.tsx`, NE dark `AuthField`) sa dve sekcije: profil (ime/prezime/opis + Sačuvaj) i promena lozinke. Ruta `/settings` **pod `ChatShell`** (zaštićena) ili samostalna zaštićena ruta.
  - Link do `/settings` iz `ChatSidebar` (npr. pored logout dugmeta ikonica zupčanika).
  - i18n `settings.*` EN+SR.
  - Rešava i „Vuke" problem (nalog registrovan sa imenom Vuke).
</details>

### 2. Polish — GOTOVO (2026-07-07)
- **Reduced-motion** ✓: `main.tsx` uvijen u `<MotionConfig reducedMotion="user">` (sve framer-motion animacije poštuju sistemsko podešavanje — slajdovi se gase, fade ostaje). Novi hook `hooks/usePrefersReducedMotion.ts` gasi canvas efekte: `CursorTrail`/`CursorGlow` vraćaju `null`, `DiamondCanvas` crta jedan miran kadar (origin pozicije, bez intro leta/drifta/shimmera/repulzije). **Napomena:** preview alat NE ume da emulira `prefers-reduced-motion` — proveri ručno u pravom browseru (DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce).
- **Mobilni audit** ✓ na 375px: `/`, `/login`, `/register`, `/settings`, `/chat` — nigde horizontalnog scrolla. Chat drawer radi (hamburger → `translateX(0)`, backdrop se pojavi, `isDesktop=false` korektno).
- **`npm run build`** ✓ prolazi čisto. **Usput popravljeno:** `ForgotPassword.tsx` je imao neiskorišćen `import { m }` koji je rušio `tsc -b` build (ali NE `tsc --noEmit`). Bundle: react-vendor 109kB gz, index 53kB gz, motion 34kB gz; landing sekcije već lazy-load.

### 3. Optimizacija
- Proveri veličinu bundla posle `npm run build` (dist). Chat stranice lazy-load kao i homepage sekcije ako vredi. `react-markdown`+`remark-gfm` su najveći novi dep — može lazy import u `ChatRoom`.

### 4. Deploy (preporuka: najlakša besplatna kombinacija)
**Arhitektura:** Frontend → **Vercel**; Backend (FastAPI) → **Render**; Postgres → **Neon**.
Vercel NE može da pokrene FastAPI+Postgres — zato zaseban host.

**Koraci:**
1. **ROTIRAJ SECRETE** pre javnog sajta (bili su podeljeni u chatu): napravi nov Gemini API ključ (aistudio.google.com/apikey) i nov Gmail app password. Stari stavi van upotrebe.
2. **Neon** (neon.tech): napravi projekat → dobiješ `DATABASE_URL`. Konvertuj u `postgresql+psycopg://...` format (dodaj `+psycopg`). `create_all` na startu napravi tabele automatski (nema Alembic-a).
3. **Render** (render.com) → New Web Service iz GitHub repo-a, root `ancora/backend`:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Env vars: `DATABASE_URL` (Neon, +psycopg), `JWT_SECRET` (nov random), `SMTP_HOST/PORT/USER/PASSWORD`, `EMAIL_FROM`, `GOOGLE_API_KEY` (nov), `GOOGLE_MODEL=gemini-2.5-flash`, `FRONTEND_URL` (Vercel URL), `CORS_ORIGINS` (Vercel URL).
   - Napomena: `truststore` je za lokalni SSL problem; na Render Linuxu verovatno nije potreban ali ne smeta.
4. **Vercel** → import repo, root `ancora/frontend`, framework Vite. Env: `VITE_API_URL=https://<render-app>.onrender.com`. Build: `npm run build`, output `dist`.
5. Posle deploya: ažuriraj Render `FRONTEND_URL` i `CORS_ORIGINS` na pravi Vercel domen; verifikacioni/reset mejlovi tada nose javni link koji radi sa svih uređaja.
6. Test: registracija sa pravim mejlom → verifikacija → login → chat → forgot password, sve sa telefona.

## Poznati problemi / napomene iz prethodne sesije
- `gemini-2.5-pro` ima **limit=0** na free tieru (429) — ostati na `gemini-2.5-flash`.
- Uzastopne `user` poruke bez para su rušile Gemini (naizmenične role) → rešeno `_dedupe_consecutive_roles` u `routers/chats.py`.
- Lokalni SSL `CERTIFICATE_VERIFY_FAILED` ka Gemini/pip → rešeno `truststore.inject_into_ssl()` na vrhu `app/main.py` (+ `--trusted-host` za pip).
- Preview MCP alat: zamrzava `requestAnimationFrame`, blokira programski scroll i clipboard, screenshot puca na teškim animacijama → vizuelne stvari testiraj u pravom browseru.
- Ima zaostalih test chatova u bazi — očisti po želji: `DELETE FROM chats;` (cascade briše poruke).
- Commit stil: BEZ `Co-Authored-By: Claude` trailera (portfolio pod korisnikovim imenom).

## Redosled za novu sesiju (predlog)
1. Dovrši forgot/reset wiring (rute + login link) → test.
2. Profil settings (backend + frontend) → test.
3. Reduced-motion + mobilni audit + `npm run build`.
4. Commit + push.
5. Deploy (rotacija secreta → Neon → Render → Vercel) uz vođenje korak-po-korak.
