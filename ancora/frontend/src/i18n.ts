import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const en = {
  nav: { login: 'Log in', getStarted: 'Get started' },
  hero: {
    titleLine1: 'Clarity in every',
    titleWord: 'connection',
    subtitle: 'Describe your situation and get wise, dignified advice that helps you navigate relationships with honesty and compassion.',
    startFree: 'Start for free',
    learnMore: 'Learn more',
  },
  how: {
    title: 'How it works',
    subtitle: 'Three simple steps to get the clarity you need.',
    step: 'STEP',
    steps: [
      { title: 'Tell us about yourself', description: 'Create your profile and describe who you are, so Ancora understands your perspective from the start.' },
      { title: 'Describe your situation', description: "Share what happened and who's involved. The more detail you give, the better the guidance." },
      { title: 'Get wise, honest advice', description: 'Receive thoughtful counsel that protects your dignity and keeps you grounded in your values.' },
    ],
    profile: { you: 'You', traits: ['Honest', 'Introvert', 'Values family'] },
    chat: { message: "I had a falling out with my brother over our late father's house, and I don't know how to fix it." },
    advice: { name: 'Ancora', text: 'Before reacting, name what you actually feel. Reach out to your brother to understand him — not to win.' },
  },
  features: {
    title: 'Why Ancora',
    subtitle: 'More than advice — a thoughtful companion for every relationship challenge.',
    diveIn: 'Dive in',
    items: [
      { title: 'Context-aware AI', essence: 'Advice that remembers.', description: 'Ancora remembers your conversations and the people involved, so the guidance evolves with you over time.' },
      { title: 'No judgment', essence: 'A safe space, always.', description: 'Share what you really feel and be heard with care. No lectures, no shame — only thoughtful understanding.' },
      { title: 'Your dignity first', essence: 'Grounded in your values.', description: 'Every response keeps you respected and true to who you are, helping you act from strength, not impulse.' },
      { title: 'Available anytime', essence: 'Here at 3am.', description: "Whether it's the middle of the night or a hard Monday morning, Ancora is always ready to listen and help." },
    ],
  },
  about: {
    quote: '"The quality of your relationships defines the quality of your life."',
    principle: 'The Ancora principle',
    paragraph: 'Ancora was built on the belief that everyone deserves honest, thoughtful guidance — not just generic advice, but counsel that respects who you are.',
    values: [
      { label: 'Honesty', desc: 'We tell you the truth, not what you want to hear.' },
      { label: 'Dignity', desc: 'Every response honours your worth and values.' },
      { label: 'Clarity', desc: 'No noise. Just the insight that matters most.' },
    ],
  },
  cta: {
    eyebrow: 'Loved by thousands',
    age: 'Age {{age}}',
    testimonials: [
      { quote: "Finally, someone that doesn't judge and actually helps me think clearly.", name: 'Sarah' },
      { quote: 'I was spiraling over a fight with my partner. Ancora helped me see my part in it.', name: 'Marco' },
      { quote: 'More honest than my friends, more empathetic than I expected from AI.', name: 'Priya' },
    ],
    title: 'Ready for clarity?',
    subtitle: 'Join thousands of people who found their anchor in difficult moments.',
    button: 'Create your free account',
    reassurances: ['Free to start', 'Private & secure', 'No credit card'],
  },
  footer: {
    tagline: 'Wise, dignified relationship advice — whenever you need it.',
    explore: 'Explore',
    legal: 'Legal',
    links: { how: 'How it works', why: 'Why Ancora', about: 'About', privacy: 'Privacy', terms: 'Terms' },
    rights: '© 2026 Ancora. All rights reserved.',
    clarity: 'Clarity in every connection.',
  },
}

const sr: typeof en = {
  nav: { login: 'Prijava', getStarted: 'Započni' },
  hero: {
    titleLine1: 'Jasnoća u svakoj',
    titleWord: 'vezi',
    subtitle: 'Opišite svoju situaciju i dobijte mudar, dostojanstven savet koji vam pomaže da kroz odnose prolazite sa iskrenošću i saosećanjem.',
    startFree: 'Započni besplatno',
    learnMore: 'Saznaj više',
  },
  how: {
    title: 'Kako funkcioniše',
    subtitle: 'Tri jednostavna koraka do jasnoće koja vam treba.',
    step: 'KORAK',
    steps: [
      { title: 'Reci nam o sebi', description: 'Napravi profil i opiši ko si, da te Ancora razume iz tvog ugla od početka.' },
      { title: 'Opiši svoju situaciju', description: 'Podeli šta se desilo i ko je uključen. Što više detalja daš, bolji je savet.' },
      { title: 'Dobij mudar, iskren savet', description: 'Dobijaš promišljen savet koji čuva tvoje dostojanstvo i drži te uz tvoje vrednosti.' },
    ],
    profile: { you: 'Ti', traits: ['Iskren', 'Introvert', 'Ceni porodicu'] },
    chat: { message: 'Posvađao sam se sa bratom oko kuće našeg pokojnog oca i ne znam kako da to popravim.' },
    advice: { name: 'Ancora', text: 'Pre nego što reaguješ, imenuj šta zaista osećaš. Obrati se bratu da ga razumeš — ne da pobediš.' },
  },
  features: {
    title: 'Zašto Ancora',
    subtitle: 'Više od saveta — promišljen saputnik za svaki izazov u odnosima.',
    diveIn: 'Zaroni',
    items: [
      { title: 'AI koji pamti kontekst', essence: 'Savet koji pamti.', description: 'Ancora pamti tvoje razgovore i ljude u njima, pa savet raste zajedno s tobom.' },
      { title: 'Bez osude', essence: 'Uvek bezbedan prostor.', description: 'Podeli šta zaista osećaš i budi saslušan s pažnjom. Bez pridika, bez stida — samo promišljeno razumevanje.' },
      { title: 'Tvoje dostojanstvo na prvom mestu', essence: 'Utemeljeno u tvojim vrednostima.', description: 'Svaki odgovor te čuva poštovanim i vernim sebi, pomažući ti da deluješ iz snage, a ne iz impulsa.' },
      { title: 'Dostupna bilo kad', essence: 'Tu i u 3 ujutru.', description: 'Bilo da je gluvo doba noći ili teško ponedeljak ujutru, Ancora je uvek spremna da sasluša i pomogne.' },
    ],
  },
  about: {
    quote: '„Kvalitet tvojih odnosa određuje kvalitet tvog života."',
    principle: 'Ancora princip',
    paragraph: 'Ancora je nastala iz uverenja da svako zaslužuje iskreno, promišljeno vođstvo — ne uopšten savet, već onaj koji poštuje ko si.',
    values: [
      { label: 'Iskrenost', desc: 'Govorimo ti istinu, ne ono što želiš da čuješ.' },
      { label: 'Dostojanstvo', desc: 'Svaki odgovor poštuje tvoju vrednost i principe.' },
      { label: 'Jasnoća', desc: 'Bez buke. Samo uvid koji najviše znači.' },
    ],
  },
  cta: {
    eyebrow: 'Vole nas hiljade',
    age: '{{age}} god.',
    testimonials: [
      { quote: 'Konačno neko ko ne osuđuje i zaista mi pomaže da razmišljam jasno.', name: 'Sara' },
      { quote: 'Vrteo sam se u krug posle svađe sa partnerkom. Ancora mi je pomogla da vidim svoj deo u tome.', name: 'Marko' },
      { quote: 'Iskrenija od mojih prijatelja, empatičnija nego što sam očekivala od veštačke inteligencije.', name: 'Prija' },
    ],
    title: 'Spreman za jasnoću?',
    subtitle: 'Pridruži se hiljadama ljudi koji su našli svoje sidro u teškim trenucima.',
    button: 'Napravi besplatan nalog',
    reassurances: ['Besplatno za početak', 'Privatno i sigurno', 'Bez kartice'],
  },
  footer: {
    tagline: 'Mudar, dostojanstven savet za odnose — kad god ti zatreba.',
    explore: 'Istraži',
    legal: 'Pravno',
    links: { how: 'Kako funkcioniše', why: 'Zašto Ancora', about: 'O nama', privacy: 'Privatnost', terms: 'Uslovi' },
    rights: '© 2026 Ancora. Sva prava zadržana.',
    clarity: 'Jasnoća u svakoj vezi.',
  },
}

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sr: { translation: sr } },
  lng: stored === 'sr' || stored === 'en' ? stored : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
