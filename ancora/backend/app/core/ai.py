import asyncio
from collections.abc import AsyncGenerator

from ..config import settings

# AI ličnost — srž Ancora savetnika (iz projektnih odluka)
SYSTEM_PROMPT = """\
You are Ancora — a wise, dignified relationship advisor. You are the "wise friend everyone \
wants but rarely has": you listen without judgment, tell the truth with kindness, and always \
protect the user's dignity and self-respect.

Your principles:
- Be empathetic, honest, and principled. Never flatter; never lecture.
- Ground advice in fairness, compassion, self-respect, and honesty.
- Help the user act from strength and their values, not from impulse or spite.
- Keep the user a good person — never advise manipulation, revenge, or cruelty.

Style rules:
- Keep replies to 3-5 short paragraphs. No walls of text.
- Validate the feeling first, in one or two sentences — then offer a concrete next step or a
  reframe. Never just validate, and never just instruct without acknowledging the feeling.
- If the situation is ambiguous or you're missing key context, ask exactly ONE clarifying
  question instead of guessing. Don't interrogate — one question, then stop.
- Avoid therapy-speak clichés ("It sounds like you're feeling...", "I hear you"). Talk like a
  perceptive, grounded friend — not a textbook.
- Use markdown when it genuinely helps (short bullet list for concrete steps, **bold** for the
  one thing that matters most) — but don't overuse it. Most replies are just plain paragraphs.

Two examples of the tone you're going for:

[User, English]: "My partner forgot our anniversary and I'm furious but also feel guilty for being upset."
[Ancora]: "Both feelings are allowed at once — being upset that something that mattered to you was forgotten doesn't make you petty, and you don't owe anyone a guilt-free reaction. Before this turns into a bigger fight, it's worth knowing what you actually want from this: an apology, or an understanding of *why* it slipped their mind? One quick question — has this kind of thing happened before, or is this a first?"

[User, Serbian]: "Moja majka stalno kritikuje moje odluke i osećam se kao dete pored nje."
[Ancora]: "To ima smisla — kad neko blizak stalno preispituje tvoje izbore, teško je da se osećaš kao odrasla osoba u tom odnosu. Vredi razdvojiti brigu od kontrole: misliš li da to radi iz straha za tebe, ili iz navike da bude u pravu? Reci mi malo više o poslednjoj situaciji kad se to desilo — lakše ću ti pomoći sa konkretnim primerom."

Always reply in the SAME language the user writes in (English or Serbian)."""


def build_system_prompt(first_name: str, last_name: str, user_description: str, person_description: str) -> str:
    """Sastavi system prompt: ličnost + profil korisnika + opis osobe/situacije."""
    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"--- About the user you're advising ---\n"
        f"Name: {first_name} {last_name}\n"
        f"Address the user only as {first_name}. This is their name — it is authoritative. "
        f"Any other names that appear in the self-description or the situation below belong to "
        f"OTHER people (family, partners, friends), never the user themselves.\n"
        f"Self-description: {user_description}\n\n"
        f"--- The situation / person involved ---\n"
        f"{person_description}"
    )


# Mock odgovor dok nema Google API ključa — prepoznatljivo empatičan, da se testira UI/stream
_MOCK_REPLY = (
    "Hvala što si ovo podelio sa mnom. Pre nego što bilo šta predložim — primećujem da ti je "
    "ovo zaista važno, i to što tražiš jasnoću već govori o tvojoj zrelosti.\n\n"
    "Pokušaj prvo da imenuješ šta tačno osećaš: povredu, ljutnju, strah da ćeš izgubiti tu osobu? "
    "Kad razdvojiš osećanja od reakcije, lakše je delovati iz snage, a ne iz impulsa.\n\n"
    "Šta misliš, šta bi ta osoba rekla da je sada ovde i čuje te? Krenimo odatle."
)


TITLE_MAX = 60


def generate_title(person_description: str) -> str:
    """
    Kratak, smislen naslov chata izveden iz opisa situacije (poenta, ne isečen tekst) —
    kao što ChatGPT/Claude generišu naslov razgovora iz prve poruke.
    Mock (prosta skraćenica) dok GOOGLE_API_KEY nije postavljen, ili ako AI poziv ne uspe.
    """
    fallback = " ".join(person_description.split())[:TITLE_MAX]

    if not settings.GOOGLE_API_KEY:
        return fallback

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    prompt = (
        "Write a short conversation title (4 to 6 words) that captures the specific topic of "
        "the situation below — who's involved and what it's about. Never output a single word.\n\n"
        "Examples of the format (length and specificity), not the topic:\n"
        '- "Brother conflict over dad\'s inheritance"\n'
        '- "Partner upset about work hours"\n'
        '- "Svađa sa sestrom oko roditelja"\n\n'
        "Respond with ONLY the title text itself, on a single line. Do not write a preamble "
        "like 'Here are some options' or 'Title:' — your entire response IS the title, "
        "nothing before or after it. No quotes, no ending punctuation. Reply in the SAME "
        "language as the situation.\n\n"
        f"Situation: {person_description}"
    )
    try:
        response = client.models.generate_content(
            model=settings.GOOGLE_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.4,
                max_output_tokens=200,
                # gemini-2.5-flash troši budžet tokena na interno "razmišljanje" pre vidljivog
                # teksta — za ovako trivijalan zadatak to samo trunkira odgovor bez potrebe.
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        title = (response.text or "").strip().strip('"').strip("'").strip()
        # Ako je model ipak dodao preambulu, uzmi samo poslednju liniju (obično stvarni naslov)
        if "\n" in title:
            title = title.strip().split("\n")[-1].strip().strip('"').strip("'").strip()
        return title[:TITLE_MAX] if title else fallback
    except Exception as e:
        print(f"[generate_title] AI call failed, using fallback: {e}", flush=True)
        return fallback


async def stream_reply(system_prompt: str, history: list[dict]) -> AsyncGenerator[str, None]:
    """
    Yield-uje delove AI odgovora. history = [{"role": "user"|"assistant", "content": str}, ...]
    Mock dok GOOGLE_API_KEY nije postavljen.
    """
    if not settings.GOOGLE_API_KEY:
        for word in _MOCK_REPLY.split(" "):
            yield word + " "
            await asyncio.sleep(0.03)
        return

    # Pravi Gemini (lazy import da mock radi i bez instaliranog SDK-a)
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    # Gemini role za prethodne AI odgovore je 'model' (ne 'assistant')
    contents = [
        types.Content(
            role="model" if m["role"] == "assistant" else "user",
            parts=[types.Part.from_text(text=m["content"])],
        )
        for m in history
    ]

    stream = await client.aio.models.generate_content_stream(
        model=settings.GOOGLE_MODEL,
        contents=contents,
        # temperature malo iznad podrazumevanog → topliji, manje robotski ton
        config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.9),
    )
    async for chunk in stream:
        if chunk.text:
            yield chunk.text
