import smtplib
from email.message import EmailMessage

from ..config import settings


def _verify_link(token: str) -> str:
    return f"{settings.FRONTEND_URL}/verify?token={token}"


def send_verification_email(to_email: str, first_name: str, token: str) -> None:
    """Pošalji verifikacioni email. Ako SMTP nije podešen → ispiši link u konzolu (dev)."""
    link = _verify_link(token)

    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        # Dev fallback — bez pravog emaila, link ide u backend konzolu
        print("\n" + "=" * 70)
        print(f"  [DEV] Verifikacioni link za {to_email}:")
        print(f"  {link}")
        print("=" * 70 + "\n", flush=True)
        return

    msg = EmailMessage()
    msg["Subject"] = "Potvrdi svoj nalog na Ancora"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(
        f"Zdravo {first_name},\n\n"
        f"Potvrdi svoj email klikom na link (ističe za 24h):\n{link}\n\n"
        f"Ako se nisi registrovao, slobodno ignoriši ovu poruku.\n\n— Ancora"
    )
    msg.add_alternative(
        f"""\
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;color:#1A1A1A">
          <h2 style="font-family:'Playfair Display',Georgia,serif;color:#0C3D2D">Dobrodošao u Ancora, {first_name}</h2>
          <p>Potvrdi svoj email da aktiviraš nalog. Link ističe za 24 sata.</p>
          <p style="margin:28px 0">
            <a href="{link}" style="background:#1FD65F;color:#07130E;text-decoration:none;
               padding:12px 28px;border-radius:999px;font-weight:600;display:inline-block">
              Potvrdi email
            </a>
          </p>
          <p style="color:#6B7280;font-size:13px">Ako se nisi registrovao, ignoriši ovu poruku.</p>
        </div>
        """,
        subtype="html",
    )

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
