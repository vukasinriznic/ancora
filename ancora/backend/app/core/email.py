import smtplib
from email.message import EmailMessage

from ..config import settings


def _send(to_email: str, subject: str, text: str, html: str, dev_label: str, link: str) -> None:
    """Zajednički SMTP sender. Ako SMTP nije podešen → ispiši link u konzolu (dev fallback)."""
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("\n" + "=" * 70)
        print(f"  [DEV] {dev_label} za {to_email}:")
        print(f"  {link}")
        print("=" * 70 + "\n", flush=True)
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)


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


def send_verification_email(to_email: str, first_name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify?token={token}"
    _send(
        to_email,
        subject="Potvrdi svoj nalog na Ancora",
        text=(
            f"Zdravo {first_name},\n\n"
            f"Potvrdi svoj email klikom na link (ističe za 24h):\n{link}\n\n"
            f"Ako se nisi registrovao, slobodno ignoriši ovu poruku.\n\n— Ancora"
        ),
        html=_button_email(
            f"Dobrodošao u Ancora, {first_name}",
            "Potvrdi svoj email da aktiviraš nalog. Link ističe za 24 sata.",
            link,
            "Potvrdi email",
            "Ako se nisi registrovao, ignoriši ovu poruku.",
        ),
        dev_label="Verifikacioni link",
        link=link,
    )


def send_reset_email(to_email: str, first_name: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    _send(
        to_email,
        subject="Reset lozinke — Ancora",
        text=(
            f"Zdravo {first_name},\n\n"
            f"Zatražen je reset lozinke. Klikni na link da postaviš novu (ističe za 1h):\n{link}\n\n"
            f"Ako to nisi ti, slobodno ignoriši ovu poruku — lozinka ostaje nepromenjena.\n\n— Ancora"
        ),
        html=_button_email(
            "Reset lozinke",
            f"Zdravo {first_name}, klikni ispod da postaviš novu lozinku. Link ističe za 1 sat.",
            link,
            "Postavi novu lozinku",
            "Ako nisi ti zatražio reset, ignoriši ovu poruku.",
        ),
        dev_label="Reset link",
        link=link,
    )
