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
    ],
    practical: ["Talk to a health professional to choose the method that fits you.", "Condoms are free at health centers.", "Emergency contraception exists and should be used as soon as possible."],
    warning: ["A late period after unprotected sex.", "Side effects that worry you."],
    services: ["Health center", "Community pharmacy"],
    sources: ["Ministry of Health – Sexual and reproductive health", "WHO – Family planning"],
  },
  {
    slug: "sti",
    title: "Sexually transmitted infections",
    summary: "STIs can be prevented, tested for and treated. Many cause no symptoms.",
    explain: ["HIV, syphilis, hepatitis, HPV and chlamydia are examples. Rapid tests are free in the public system.", "The HPV vaccine is offered free to adolescents."],
    practical: ["Use condoms.", "Get tested regularly if you are sexually active.", "Go to a health center if you have questions — care is your right."],
    warning: ["Sores, warts or discharge.", "Pain or burning when you urinate."],
    services: ["Health center", "Testing and counseling center (CTA)"],
    sources: ["Ministry of Health – STI/HIV", "PAHO"],
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
