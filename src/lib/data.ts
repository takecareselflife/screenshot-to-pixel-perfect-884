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
    summary: "Body changes are normal. Everyone has their own pace.",
    explain: [
      "Puberty brings growth, body hair, periods, and voice and mood changes.",
      "Sexuality includes feelings, identity and relationships — not just sex.",
    ],
    practical: ["Ask a health professional your questions.", "Take your time. No pressure.", "Look after your hygiene and your sleep."],
    warning: ["Severe pain or unusual bleeding.", "Someone pressuring you to do something you don't want."],
    services: ["Basic health unit"],
    sources: ["Ministry of Health – Adolescent Health Handbook", "WHO – Adolescent health"],
  },
  {
    slug: "contraception",
    title: "Contraceptive methods",
    summary: "Prevent pregnancy. Use condoms to reduce STI risk too.",
    explain: [
      "Options: condoms, pill, injection, IUD and implant. Some are free in public health services.",
      "Condoms are the only method that also reduces STI risk.",
      "Morning-after pill: after unprotected sex. It delays ovulation — it does not end a pregnancy and does not prevent STIs.",
      "The sooner the better: up to 3 days for levonorgestrel, up to 5 days for ulipristal or the copper IUD. It does not protect sex afterwards — keep using condoms.",
    ],
    practical: ["Choose a method with a health professional.", "Condoms are free at health centers.", "Emergency? Go to a health center or pharmacy today.", "Pregnancy test 3 weeks after unprotected sex. Vomited right after the pill? Ask a pharmacist."],
    warning: ["A late period after unprotected sex.", "Side effects that worry you."],
    services: ["Health center", "Community pharmacy"],
    sources: ["Ministry of Health – Sexual and reproductive health", "WHO – Emergency contraception (https://www.who.int/news-room/fact-sheets/detail/emergency-contraception)", "CDC – Emergency contraception (https://www.cdc.gov/contraception/hcp/usspr/emergency-contraception.html)"],
  },
  {
    slug: "sti",
    title: "Sexually transmitted infections",
    summary: "Many STIs have no symptoms. Use protection and get tested.",
    explain: [
      "STIs include HIV, syphilis, HPV and chlamydia. Public health services offer free rapid tests and HPV vaccination.",
      "Oral sex can transmit gonorrhea, syphilis, herpes and HPV.",
      "Anal sex has a higher HIV risk: the thin rectal lining can tear.",
      "No symptoms does not mean no STI. Use condoms and get tested.",
      "Anal-to-vaginal contact can cause urinary infection (UTI). UTIs are not STIs.",
    ],
    practical: [
      "New condom for each act. For oral contact, use a dental dam or cut-open condom.",
      "For anal sex, use condoms and plenty of water- or silicone-based lubricant.",
      "Before anal-to-vaginal contact, change the condom and clean hands and toys.",
      "Peeing after sex may help with UTIs, but does not prevent STIs or pregnancy.",
      "Get tested and mention oral, vaginal or anal contact. Any new genital sore needs care.",
    ],
    warning: ["New genital lesion or unusual discharge: seek care.", "Burning, frequent urination or blood in urine: seek care.", "Fever, back pain, vomiting or severe pelvic pain: seek prompt care.", "Possible HIV exposure? Ask for PEP within 72 hours."],
    services: ["Health center", "Testing and counseling center (CTA)"],
    sources: ["Ministry of Health – STI/HIV", "WHO – Sexually transmitted infections (https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis))", "CDC – About STI risk and oral sex (https://www.cdc.gov/sti/about/about-sti-risk-and-oral-sex.html)", "CDC – HIV risk reduction (https://www.cdc.gov/hiv/risk/index.html)", "NHS – Urinary tract infections (https://www.nhs.uk/conditions/urinary-tract-infections-utis/)"],
  },
  {
    slug: "consent",
    title: "Consent and healthy relationships",
    summary: "Consent is a free, clear, informed yes. You can change your mind.",
    explain: ["No pressure, threats or manipulation. Silence is not yes.", "Healthy relationships mean respect, trust and freedom."],
    practical: ["You can say no at any time.", "Ask, and respect the answer you get.", "Excessive jealousy and control are not love."],
    warning: ["Someone controlling your phone or your clothes.", "Threats or blackmail.", "Being kept away from friends and family."],
    services: ["Health center", "Social assistance center (CREAS)", "Child Protection Council"],
    sources: ["UN Convention on the Rights of the Child", "UNICEF"],
  },
  {
    slug: "mental-health",
    title: "Mental health, anxiety and depression",
    summary: "Sad or anxious? You deserve support.",
    explain: ["Anxiety and depression are common and treatable.", "Sleep, food, movement and close relationships support well-being.", "Isolating, avoiding friends or becoming distant can signal emotional distress. Alone time is normal; ongoing withdrawal deserves support. It is not a diagnosis."],
    practical: ["Talk to someone you trust.", "Breathe slowly: inhale for 4 seconds, exhale for 6.", "Go to a basic health unit or a psychological care center."],
    warning: ["Sadness that lasts for weeks.", "Thoughts of hurting yourself.", "Losing interest in everything.", "Ongoing isolation or distance from friends: talk to someone you trust and seek professional support."],
    services: ["Basic health unit", "Psychological care center", "CVV – 188"],
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
    sources: ["WHO – Care for people in situations of sexual violence", "UN Convention on the Rights of the Child"],
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
    summary: "Sharing intimate images without consent is a crime. It is not the victim's fault.",
    explain: ["Sexual images of people under 18 are illegal in any situation.", "Platforms have channels to remove content."],
    practical: ["Don't delete the evidence if it is safe to keep it.", "Report it to the platform and to SaferNet.", "Use strong passwords and two-step verification."],
    warning: ["Blackmail with photos (sextortion).", "Fake accounts using your name."],
    services: ["SaferNet Brazil", "Police station", "Disque 100"],
    sources: ["SaferNet Brazil", "Law 13.718/2018"],
  },
  {
    slug: "rights",
    title: "Sexual rights, gender and how to get help",
    summary: "You have a right to health, respect and care for your gender.",
    explain: [
      "The UN Convention on the Rights of the Child guarantees your protection. Health services must respect your privacy.",
      "Sexual rights mean being informed, respected and free from coercion — whatever your orientation or gender identity.",
      "Trans and gender-diverse people have the right to hormone therapy in public health services, with prescription and medical follow-up.",
      "Follow-up can happen at a primary care outpatient clinic: the team checks your health, asks for exams and refers you when needed.",
    ],
    practical: [
      "Go to a health center and ask for care, including care about your gender.",
      "Ask for the primary care outpatient clinic or the trans health outpatient to talk about hormone therapy.",
      "Keep your appointments and exams.",
      "Confidentiality has limits when your life or safety is at risk.",
    ],
    warning: [
      "Never start hormones on your own or with someone else's prescription.",
      "Being refused respectful treatment is a rights violation — you can report it.",
      "Suffering any form of violence.",
    ],
    services: ["Health center (primary care outpatient)", "Trans health outpatient", "Child Protection Council", "Public Defender's Office", "Disque 100"],
    sources: ["UN Convention on the Rights of the Child", "WHO — care for people with gender identity dysphoria", "UNICEF — inclusion of gender-diverse adolescents", "Endocrine Society — hormone therapy guidance"],
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
  { id: "s3", name: "Girassol Adolescent Psychological Care Center (fictional)", type: "Mental health", city: "Vila Aurora", region: "South", address: "12 Model Street", phone: "(00) 0000-0003", hours: "Mon–Fri, 8am–6pm", access: "Open door for adolescents", verified: true },
  { id: "s4", name: "Rosa Referral Service (fictional)", type: "Violence response", city: "Vila Aurora", region: "Downtown", phone: "(00) 0000-0004", hours: "24 hours", access: "Care without needing a police report", verified: true },
  { id: "s5", name: "East Side Child Protection Council (fictional)", type: "Protection", city: "Vila Aurora", region: "East", address: "8 Test Square", phone: "(00) 0000-0005", verified: true },
  { id: "s6", name: "Bela Vista Health Center (fictional)", type: "Health center", city: "Porto Sereno", region: "North", verified: false },
  { id: "s7", name: "Ipê Psychological Care Center (fictional)", type: "Mental health", city: "Porto Sereno", region: "Downtown", address: "300 Simulated Street", hours: "Mon–Fri, 8am–5pm", verified: true },
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
