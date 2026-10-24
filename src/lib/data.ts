/**
 * Demo data (synthetic). Educational contents are general summaries and must be
 * reviewed by professionals before real use.
 * Structure is ready to be swapped for an API / official directories.
 */

export type Article = {
  slug: string;
  title: string;
  summary: string;
  explain: string[];
  practical: string[];
  warning: string[];
  services: string[];
  sources: string[];
};

export const articles: Article[] = [
  {
    slug: "puberty",
    title: "Sexuality and puberty",
    summary: "Your body and emotions change, and that's normal. Everyone moves at their own pace.",
    explain: [
      "Puberty is the stage when the body changes under the action of hormones: growth, body hair, periods, and changes in your voice and emotions.",
      "Sexuality involves your body, feelings, identity and relationships — not only sex.",
    ],
    practical: ["Ask questions to health staff at your health center.", "Take your time: nobody has to rush.", "Look after your hygiene and your sleep."],
    warning: ["Severe pain or unusual bleeding.", "Someone pressuring you to do something you don't want."],
    services: ["Community health center (UBS)"],
    sources: ["Ministry of Health – Adolescent Health Handbook", "WHO – Adolescent health"],
  },
  {
    slug: "contraception",
    title: "Contraceptive methods",
    summary: "There are several ways to prevent pregnancy. Condoms also protect against STIs.",
    explain: [
      "Methods include external and internal condoms, the pill, the injection, the IUD and the implant. Some are free through the public system (SUS).",
      "Only condoms protect against sexually transmitted infections.",
      "The morning-after pill is emergency contraception for sex without contraception or when a method fails, such as a broken condom. It delays or prevents ovulation; it does not end an existing pregnancy and does not protect against STIs.",
      "Take emergency contraception as soon as possible. Levonorgestrel works best within 72 hours and may still be used up to 120 hours (5 days), but becomes less effective with time. Ulipristal can be used up to 120 hours where available. A copper IUD fitted by a professional within 5 days is the most effective emergency option.",
      "The morning-after pill does not protect against sex that happens later. Ask a health professional or pharmacist when to start or restart your regular method, because the advice differs by pill type. Keep using condoms.",
    ],
    practical: ["Talk to a health professional to choose the method that fits you.", "Condoms are free at health centers.", "If you need the morning-after pill, contact a health center or pharmacy today — do not wait for symptoms or your next period.", "Take a pregnancy test 3 weeks after the most recent unprotected sex, even if you have used emergency contraception. Seek care for a positive test or persistent concern.", "If you vomit soon after taking the pill, contact a pharmacist or health service: another dose may be needed."],
    warning: ["A late period after unprotected sex.", "Side effects that worry you."],
    services: ["Health center", "Community pharmacy"],
    sources: ["Ministry of Health – Sexual and reproductive health", "WHO – Emergency contraception (https://www.who.int/news-room/fact-sheets/detail/emergency-contraception)", "CDC – Emergency contraception (https://www.cdc.gov/contraception/hcp/usspr/emergency-contraception.html)"],
  },
  {
    slug: "sti",
    title: "Sexually transmitted infections",
    summary: "STIs can be prevented, tested for and treated. Many cause no symptoms.",
    explain: [
      "HIV, syphilis, hepatitis, HPV and chlamydia are examples. Rapid tests are free in the public system. The HPV vaccine is offered free to adolescents.",
      "Oral sex can transmit STIs, including gonorrhea, syphilis, herpes and HPV. Infections can affect the mouth or throat as well as the genitals. Oral sex is not risk-free.",
      "Anal sex has a higher risk of transmission for some infections, especially HIV for the person receiving anal sex. The rectal lining is thin and can tear easily, allowing exposure to blood and other body fluids; the risk is not explained by vascularization alone.",
      "Many STIs cause no symptoms. Feeling well or seeing no sores does not mean there is no infection. Condoms and testing at health services are important even when neither partner has symptoms.",
      "Moving from anal to vaginal sex can carry intestinal bacteria toward the vagina and urethra and increase urinary tract infection (UTI) risk. UTIs are not the same as STIs, and this risk is not limited to any sexual orientation.",
    ],
    practical: [
      "Use a new condom for each act of vaginal, anal or oral sex. For oral contact with the vulva or anus, use a dental dam or a condom cut into a flat barrier. Barriers reduce risk but cannot fully prevent infections spread by uncovered skin.",
      "For anal sex, use condoms and plenty of water- or silicone-based lubricant to reduce friction and tearing. Oil-based products can damage latex condoms.",
      "Before switching from anal to vaginal sex, put on a new condom and clean hands and sex toys; use a new condom on the toy too. Never transfer the same condom from the anus to the vagina.",
      "If you have a vulva, urinating after sex may help reduce UTI risk; avoid holding urine. It is not a guarantee and does not prevent STIs or pregnancy.",
      "Get tested at a health service even if you have no symptoms. Tell the professional about oral, vaginal or anal contact so they can advise which tests and sample sites you need and when to test. Some tests need repeating after a recent exposure.",
      "Go to a health center for any new or unusual genital lesion, such as a sore, blister, wart or lump. Do not try to diagnose it yourself; avoid sexual contact involving the affected area until assessed.",
    ],
    warning: ["Any new or unusual genital lesion, sores, blisters, warts or discharge: arrange a health assessment.", "Pain or burning when you urinate, needing to urinate often, or blood in urine: seek care.", "Fever, back or side pain, vomiting, or severe pelvic pain: seek prompt medical care.", "Possible HIV exposure within the last 72 hours: seek urgent care today to ask about post-exposure prophylaxis (PEP)."],
    services: ["Health center", "Testing and counseling center (CTA)"],
    sources: ["Ministry of Health – STI/HIV", "WHO – Sexually transmitted infections (https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis))", "CDC – About STI risk and oral sex (https://www.cdc.gov/sti/about/about-sti-risk-and-oral-sex.html)", "CDC – HIV risk reduction (https://www.cdc.gov/hiv/risk/index.html)", "NHS – Urinary tract infections (https://www.nhs.uk/conditions/urinary-tract-infections-utis/)"],
  },
  {
    slug: "consent",
    title: "Consent and healthy relationships",
    summary: "Consent is a free, clear, informed yes — and it can change at any time.",
    explain: ["Nobody should be pressured, threatened or manipulated. Silence is not yes.", "Healthy relationships are built on respect, trust and freedom."],
    practical: ["You can say no at any time.", "Ask, and respect the answer you get.", "Excessive jealousy and control are not love."],
    warning: ["Someone controlling your phone or your clothes.", "Threats or blackmail.", "Being kept away from friends and family."],
    services: ["Health center", "Social assistance center (CREAS)", "Child Protection Council"],
    sources: ["ECA (Child and Adolescent Statute, Law 8.069/1990)", "UNICEF Brazil"],
  },
  {
    slug: "mental-health",
    title: "Mental health, anxiety and depression",
    summary: "Feeling sad or anxious sometimes is human. When it weighs too much, asking for help is strength.",
    explain: ["Anxiety and depression are common and treatable.", "Sleep, food, movement and close relationships support well-being."],
    practical: ["Talk to someone you trust.", "Breathe slowly: inhale for 4 seconds, exhale for 6.", "Go to a health center or a psychosocial care center (CAPS)."],
    warning: ["Sadness that lasts for weeks.", "Thoughts of hurting yourself.", "Losing interest in everything."],
    services: ["Health center", "CAPS / CAPSi", "CVV – 188"],
    sources: ["Ministry of Health – Mental health", "WHO – Adolescent mental health"],
  },
  {
    slug: "bullying",
    title: "Bullying and psychological violence",
    summary: "Repeated humiliation, exclusion and threats are not a joke.",
    explain: ["Bullying is repeated intimidation, in person or online (cyberbullying).", "Psychological violence includes humiliating, threatening and controlling someone."],
    practical: ["Keep records (screenshots) if it is safe to do so.", "Tell someone you trust.", "It is not your fault."],
    warning: ["Fear of going to school.", "Sudden mood changes or withdrawal."],
    services: ["School", "Social assistance center (CREAS)", "Disque 100"],
    sources: ["Law 13.185/2015 (Anti-Bullying Law)"],
  },
  {
    slug: "sexual-and-digital-violence",
    title: "Sexual and digital violence",
    summary: "No sexual situation without consent is your fault. Help exists.",
    explain: ["Sexual violence is any sexual act without consent, including touching, exposing or forcing.", "It can also happen online."],
    practical: ["Go somewhere safe.", "Health services treat violence cases, including emergency prevention — the sooner the better (ideally within 72 hours).", "You can ask for help without telling every detail."],
    warning: ["Someone asks you to keep a physical contact secret.", "Requests for intimate photos."],
    services: ["Sexual violence referral service", "Child Protection Council", "Disque 100"],
    sources: ["Ministry of Health – Care for people in situations of sexual violence", "ECA"],
  },
  {
    slug: "grooming",
    title: "Harassment, coercion, threats and grooming",
    summary: "Adults or others who offer gifts and ask for secrecy may be grooming you.",
    explain: ["Grooming is when someone builds trust in order to manipulate or abuse you later.", "Coercion is forcing something through pressure, blackmail or threat."],
    practical: ["Don't agree to meet someone you met online without a trusted adult.", "Block and report.", "Tell someone."],
    warning: ["Requests for secrecy.", "Gifts or money in exchange for something.", "Threats to expose you."],
    services: ["Disque 100", "SaferNet Brazil", "Child Protection Council"],
    sources: ["SaferNet Brazil", "UNICEF"],
  },
  {
    slug: "digital-safety",
    title: "Digital safety and intimate images",
    summary: "Sharing someone's intimate images without consent is a crime. The blame is never on the person exposed.",
    explain: ["Sexual images of people under 18 are illegal in any situation.", "Platforms have channels to remove content."],
    practical: ["Don't delete the evidence if it is safe to keep it.", "Report it to the platform and to SaferNet.", "Use strong passwords and two-step verification."],
    warning: ["Blackmail with photos (sextortion).", "Fake accounts using your name."],
    services: ["SaferNet Brazil", "Police station", "Disque 100"],
    sources: ["SaferNet Brazil", "Law 13.718/2018"],
  },
  {
    slug: "rights",
    title: "Adolescent rights and how to get help",
    summary: "You have the right to health, to protection and to be heard with respect.",
    explain: ["The ECA guarantees full protection.", "Adolescents can be cared for in health services with respect for their privacy, within legal limits."],
    practical: ["You can go to a health center and ask for care.", "Confidentiality has limits when your life or safety is at risk."],
    warning: ["Having your rights denied.", "Suffering any form of violence."],
    services: ["Health center", "Child Protection Council", "Public Defender's Office"],
    sources: ["ECA (Child and Adolescent Statute, Law 8.069/1990)", "Ministry of Health – Guidelines for adolescent health care"],
  },
];

export type ServiceType = "Health center" | "Mental health" | "Violence response" | "Protection";

export type Service = {
  id: string;
  name: string;
  type: ServiceType;
  city: string;
  region: string;
  address?: string;
  phone?: string;
  hours?: string;
  access?: string;
  verified: boolean;
};

// All FICTIONAL. Missing fields = not registered/verified.
export const services: Service[] = [
  { id: "s1", name: "Jardim Esperança Health Center (fictional)", type: "Health center", city: "Vila Aurora", region: "North", address: "100 Example Street", phone: "(00) 0000-0001", hours: "Mon–Fri, 7am–7pm", access: "Walk-in, no appointment needed", verified: true },
  { id: "s2", name: "Downtown Health Center (fictional)", type: "Health center", city: "Vila Aurora", region: "Downtown", address: "45 Demo Avenue", hours: "Mon–Fri, 7am–5pm", verified: true },
  { id: "s3", name: "Girassol Adolescent Psychosocial Center (fictional)", type: "Mental health", city: "Vila Aurora", region: "South", address: "12 Model Street", phone: "(00) 0000-0003", hours: "Mon–Fri, 8am–6pm", access: "Open door for adolescents", verified: true },
  { id: "s4", name: "Rosa Referral Service (fictional)", type: "Violence response", city: "Vila Aurora", region: "Downtown", phone: "(00) 0000-0004", hours: "24 hours", access: "Care without needing a police report", verified: true },
  { id: "s5", name: "East Side Child Protection Council (fictional)", type: "Protection", city: "Vila Aurora", region: "East", address: "8 Test Square", phone: "(00) 0000-0005", verified: true },
  { id: "s6", name: "Bela Vista Health Center (fictional)", type: "Health center", city: "Porto Sereno", region: "North", verified: false },
  { id: "s7", name: "Ipê Psychosocial Center (fictional)", type: "Mental health", city: "Porto Sereno", region: "Downtown", address: "300 Simulated Street", hours: "Mon–Fri, 8am–5pm", verified: true },
  { id: "s8", name: "Porto Sereno Social Assistance Center (fictional)", type: "Protection", city: "Porto Sereno", region: "South", phone: "(00) 0000-0008", verified: true },
];

// Real, public national hotlines (Brazil)
export const hotlines = [
  { name: "SAMU", number: "192", desc: "Medical emergency" },
  { name: "CVV", number: "188", desc: "Emotional support, 24h, free" },
  { name: "Police", number: "190", desc: "Immediate danger" },
  { name: "Disque 100", number: "100", desc: "Report rights violations" },
];

export type Questionnaire = {
  id: string;
  title: string;
  questions: string[];
};

// Self-reflection questions — these are NOT validated clinical instruments.
export const questionnaires: Questionnaire[] = [
  { id: "humor", title: "Mood", questions: ["In the last two weeks, I felt down.", "I lost interest in things I used to enjoy.", "I felt hopeless."] },
  { id: "ansiedade", title: "Anxiety and stress", questions: ["I felt nervous or tense.", "I had trouble stopping worrying.", "I felt overwhelmed by my tasks."] },
  { id: "sono", title: "Sleep", questions: ["I had trouble falling asleep.", "I woke up tired.", "I used my phone late and slept little."] },
  { id: "relacoes", title: "Relationships and safety", questions: ["I felt alone.", "I felt unsafe at home, at school or online.", "Someone made me feel afraid."] },
];

export const scale = ["Never", "Sometimes", "Often", "Almost always"];

export type RequestStatus = "New" | "Contacted" | "Received" | "Referred" | "In follow-up";

export type SupportRequest = {
  id: string;
  createdAt: string;
  topic: string;
  contact: string;
  city: string;
  status: RequestStatus;
  notes: string[];
};

export const demoRequests: SupportRequest[] = [
  { id: "SOL-0001", createdAt: "2026-10-20", topic: "I want to talk to a professional", contact: "Phone (demo)", city: "Vila Aurora", status: "New", notes: [] },
  { id: "SOL-0002", createdAt: "2026-10-19", topic: "Mental health", contact: "Email (demo)", city: "Vila Aurora", status: "Contacted", notes: ["First contact made (demo)."] },
  { id: "SOL-0003", createdAt: "2026-10-17", topic: "Contraception", contact: "In person at the health center", city: "Porto Sereno", status: "Referred", notes: ["Referred to Bela Vista Health Center (demo)."] },
  { id: "SOL-0004", createdAt: "2026-10-15", topic: "Violence online", contact: "Phone (demo)", city: "Vila Aurora", status: "In follow-up", notes: ["Received and supported.", "Follow-up scheduled (demo)."] },
];
