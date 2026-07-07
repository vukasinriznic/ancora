import smtplib
from email.message import EmailMessage
from email.utils import parseaddr

import httpx

from ..config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def _send(to_email: str, subject: str, text: str, html: str, dev_label: str, link: str) -> None:
    """
    Šalje email. Redosled:
      1) Brevo HTTP API (produkcija — Render blokira izlazni SMTP)
      2) SMTP (lokalni dev, ako je podešen)
      3) Ispis linka u konzolu (dev fallback bez ikakve konfiguracije)
    Greške se loguju (flush=True) i ne ruše pozadinski task.
    """
    # 1) Brevo preko HTTPS (radi svuda, uključujući Render)
    if settings.BREVO_API_KEY:
        name, addr = parseaddr(settings.EMAIL_FROM)
        try:
            resp = httpx.post(
                BREVO_API_URL,
                headers={"api-key": settings.BREVO_API_KEY, "content-type": "application/json"},
                json={
                    "sender": {"name": name or "Ancora", "email": addr},
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "textContent": text,
                    "htmlContent": html,
                },
                timeout=15,
            )
            resp.raise_for_status()
        except Exception as e:
            detail = getattr(getattr(e, "response", None), "text", "")
            print(f"[email] Brevo send failed for {to_email}: {e} {detail}", flush=True)
        return

    # 2) SMTP (lokalni dev)
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg.set_content(text)
        msg.add_alternative(html, subtype="html")
        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        except Exception as e:
            print(f"[email] SMTP send failed for {to_email}: {e}", flush=True)
        return

    # 3) Nema konfiguracije → ispiši link u konzolu
    print("\n" + "=" * 70)
    print(f"  [DEV] {dev_label} za {to_email}:")
    print(f"  {link}")
    print("=" * 70 + "\n", flush=True)


def _button_email(heading: str, body: str, link: str, button_label: str, footer: str) -> str:
    return f"""\
    <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;color:#1A1A1A">
      <h2 style="font-family:'Playfair Display',Georgia,serif;color:#0C3D2D">{heading}</h2>
      <p>{body}</p>
      <p style="margin:28px 0">
        <a href="{link}" style="background:#1FD65F;color:#07130E;text-decoration:none;
           padding:12px 28px;border-radius:999px;font-weight:600;display:inline-block">
          {button_label}
        </a>
      </p>
      <p style="color:#6B7280;font-size:13px">{footer}</p>
    </div>
    """


def _is_sr(language: str) -> bool:
    return (language or "").startswith("sr")


def send_verification_email(to_email: str, first_name: str, token: str, language: str = "en") -> None:
    link = f"{settings.FRONTEND_URL}/verify?token={token}"
    if _is_sr(language):
        subject = "Potvrdi svoj nalog na Ancora"
        text = (
            f"Zdravo {first_name},\n\n"
            f"Potvrdi svoj email klikom na link (ističe za 24h):\n{link}\n\n"
            f"Ako se nisi registrovao, slobodno ignoriši ovu poruku.\n\n— Ancora"
        )
        html = _button_email(
            f"Dobrodošao u Ancora, {first_name}",
            "Potvrdi svoj email da aktiviraš nalog. Link ističe za 24 sata.",
            link, "Potvrdi email",
            "Ako se nisi registrovao, ignoriši ovu poruku.",
        )
    else:
        subject = "Confirm your Ancora account"
        text = (
            f"Hi {first_name},\n\n"
            f"Confirm your email by clicking the link (expires in 24h):\n{link}\n\n"
            f"If you didn't sign up, feel free to ignore this message.\n\n— Ancora"
        )
        html = _button_email(
            f"Welcome to Ancora, {first_name}",
            "Confirm your email to activate your account. This link expires in 24 hours.",
            link, "Confirm email",
            "If you didn't sign up, ignore this message.",
        )
    _send(to_email, subject, text, html, dev_label="Verification link", link=link)


def send_reset_email(to_email: str, first_name: str, token: str, language: str = "en") -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    if _is_sr(language):
        subject = "Reset lozinke — Ancora"
        text = (
            f"Zdravo {first_name},\n\n"
            f"Zatražen je reset lozinke. Klikni na link da postaviš novu (ističe za 1h):\n{link}\n\n"
            f"Ako to nisi ti, slobodno ignoriši ovu poruku — lozinka ostaje nepromenjena.\n\n— Ancora"
        )
        html = _button_email(
            "Reset lozinke",
            f"Zdravo {first_name}, klikni ispod da postaviš novu lozinku. Link ističe za 1 sat.",
            link, "Postavi novu lozinku",
            "Ako nisi ti zatražio reset, ignoriši ovu poruku.",
        )
    else:
        subject = "Reset your password — Ancora"
        text = (
            f"Hi {first_name},\n\n"
            f"A password reset was requested. Click the link to set a new one (expires in 1h):\n{link}\n\n"
            f"If this wasn't you, feel free to ignore this message — your password stays unchanged.\n\n— Ancora"
        )
        html = _button_email(
            "Reset your password",
            f"Hi {first_name}, click below to set a new password. This link expires in 1 hour.",
            link, "Set a new password",
            "If you didn't request a reset, ignore this message.",
        )
    _send(to_email, subject, text, html, dev_label="Reset link", link=link)
