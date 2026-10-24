/** "Where does it go?" contraception game: methods, drop targets, matching rules and final quiz. */

export type TargetId = "arm" | "skin" | "uterus" | "cervix" | "vagina" | "penis" | "oral" | "injection" | "calendar";

export type MethodId =
  | "external-condom"
  | "internal-condom"
  | "pill"
  | "copper-iud"
  | "hormonal-iud"
  | "patch"
  | "ring"
  | "implant"
  | "injection"
  | "diaphragm"
  | "sponge"
  | "fertility-awareness";

export type Target = { id: TargetId; label: string; group: "female" | "inside" | "male" | "special" };

export const TARGETS: Target[] = [
  { id: "arm", label: "Upper arm", group: "female" },
  { id: "skin", label: "Skin", group: "female" },
  { id: "uterus", label: "Uterus", group: "inside" },
  { id: "cervix", label: "Cervix", group: "inside" },
  { id: "vagina", label: "Vagina", group: "inside" },
  { id: "penis", label: "Penis", group: "male" },
  { id: "oral", label: "Swallowed (by mouth)", group: "special" },
  { id: "injection", label: "Injection (muscle or under the skin)", group: "special" },
  { id: "calendar", label: "Cycle calendar", group: "special" },
];

export type FactSheet = {
  howItWorks: string;
  howUsed: string;
  hormones: string;
  effectiveness: string;
  duration: string;
  advantages: string;
  sideEffects: string;
  professional: string;
  sti: string;
};

export type Method = {
  id: MethodId;
  name: string;
  short: string;
  target: TargetId;
  /** Shown after a correct match. */
  explain: string;
  hint: string;
  note?: string;
  sheet: FactSheet;
};

const NO_STI = "No. It does not protect against STIs. Use a condom too for double protection.";

export const METHODS: Method[] = [
  {
    id: "external-condom",
    name: "External condom",
    short: "Thin cover rolled onto the erect penis.",
    target: "penis",
    explain: "It is rolled onto the erect penis before any contact and collects the semen.",
    hint: "This one is worn on the outside of a body part.",
    sheet: {
      howItWorks: "Creates a barrier that keeps sperm from reaching the vagina, anus or mouth.",
      howUsed: "Check the expiry date, open carefully, pinch the tip and roll it onto the erect penis before any genital contact. Use a new one every time.",
      hormones: "No hormones.",
      effectiveness: "In typical use, about 87 out of 100 people do not get pregnant in a year. Wrong use, tearing or slipping lower protection.",
      duration: "One condom for each sexual act.",
      advantages: "Free at basic health units, easy to find, no prescription.",
      sideEffects: "Rare. Some people are allergic to latex: latex-free condoms exist.",
      professional: "Not needed, but health staff can answer questions.",
      sti: "Yes. When used correctly, it helps prevent STIs and pregnancy.",
    },
  },
  {
    id: "internal-condom",
    name: "Internal condom",
    short: "Soft pouch placed inside the vagina.",
    target: "vagina",
    explain: "It is placed inside the vagina before sex and lines it like a soft pouch.",
    hint: "This condom goes inside the body, not over the penis.",
    sheet: {
      howItWorks: "A soft pouch lines the vagina and keeps sperm out.",
      howUsed: "Squeeze the inner ring and push it into the vagina; the outer ring stays outside. Do not use it together with an external condom.",
      hormones: "No hormones.",
      effectiveness: "In typical use, about 79 out of 100 people do not get pregnant in a year. Correct placement matters.",
      duration: "One for each sexual act. Can be inserted up to a few hours before sex.",
      advantages: "Controlled by the person who receives it; latex-free; available free in public health services.",
      sideEffects: "Rare. May feel strange at first; practice helps.",
      professional: "Not needed, but staff can show how to insert it.",
      sti: "Yes. When used correctly, it helps prevent STIs and pregnancy.",
    },
  },
  {
    id: "pill",
    name: "Contraceptive pill",
    short: "A small tablet taken every day.",
    target: "oral",
    explain: "The pill is swallowed every day. Its hormones stop ovulation.",
    hint: "This one is not placed on a body area: think about how you take a tablet.",
    sheet: {
      howItWorks: "Hormones stop the ovaries from releasing an egg and thicken cervical mucus.",
      howUsed: "Swallow one pill every day, ideally at the same time.",
      hormones: "Yes (estrogen and progestin, or progestin only).",
      effectiveness: "In typical use, about 93 out of 100 people do not get pregnant in a year. Missed pills, vomiting, diarrhea and some medicines lower protection.",
      duration: "Every day.",
      advantages: "Easy to stop; can make periods lighter and more regular.",
      sideEffects: "Nausea, breast tenderness, headaches or spotting, often only at the start.",
      professional: "Yes. A health professional checks whether it is safe for you.",
      sti: NO_STI,
    },
  },
  {
    id: "copper-iud",
    name: "Copper IUD",
    short: "Small T-shaped device with copper.",
    target: "uterus",
    explain: "A professional places it inside the uterus. Copper keeps sperm from fertilizing an egg.",
    hint: "It stays inside an organ, higher than the vagina.",
    sheet: {
      howItWorks: "Copper is toxic to sperm and prevents fertilization.",
      howUsed: "A health professional inserts it into the uterus during an appointment.",
      hormones: "No hormones.",
      effectiveness: "In typical use, more than 99 out of 100 people do not get pregnant in a year.",
      duration: "Up to 10 years, depending on the model. It can be removed earlier at any time.",
      advantages: "Long-acting, nothing to remember daily, offered by public health services.",
      sideEffects: "Periods may become heavier or more painful, especially at first.",
      professional: "Yes. Insertion, removal and follow-up are done by a professional.",
      sti: NO_STI,
    },
  },
  {
    id: "hormonal-iud",
    name: "Hormonal IUD",
    short: "Small T-shaped device that releases a hormone.",
    target: "uterus",
    explain: "A professional places it inside the uterus, where it releases a small amount of hormone.",
    hint: "Like the copper IUD, it stays inside an organ above the vagina.",
    sheet: {
      howItWorks: "Releases progestin that thickens cervical mucus and thins the uterine lining.",
      howUsed: "A health professional inserts it into the uterus during an appointment.",
      hormones: "Yes (progestin only, in a small dose).",
      effectiveness: "In typical use, more than 99 out of 100 people do not get pregnant in a year.",
      duration: "3 to 8 years, depending on the model. It can be removed earlier.",
      advantages: "Long-acting; periods often get lighter or stop.",
      sideEffects: "Irregular spotting at first, cramps, sometimes acne or headaches.",
      professional: "Yes. Insertion, removal and follow-up are done by a professional.",
      sti: NO_STI,
    },
  },
  {
    id: "patch",
    name: "Contraceptive patch",
    short: "Thin sticker that releases hormones.",
    target: "skin",
    explain: "The patch sticks to clean, dry skin (belly, buttock, back or upper arm) and hormones pass through the skin.",
    hint: "It works through the outside surface of the body.",
    sheet: {
      howItWorks: "Hormones pass through the skin and stop ovulation.",
      howUsed: "Stick a new patch on clean, dry skin once a week for 3 weeks, then have a patch-free week.",
      hormones: "Yes (estrogen and progestin).",
      effectiveness: "In typical use, about 93 out of 100 people do not get pregnant in a year. A late change or a patch that falls off lowers protection.",
      duration: "One patch per week.",
      advantages: "Only needs attention once a week.",
      sideEffects: "Skin irritation, breast tenderness, nausea or headaches.",
      professional: "Yes. A health professional checks whether it is safe for you.",
      sti: NO_STI,
    },
  },
  {
    id: "ring",
    name: "Vaginal ring",
    short: "Flexible ring that releases hormones.",
    target: "vagina",
    explain: "The ring is inserted into the vagina, where it slowly releases hormones.",
    hint: "It is placed inside the body, in the canal that leads to the cervix.",
    sheet: {
      howItWorks: "Releases hormones that stop ovulation.",
      howUsed: "Squeeze and insert it into the vagina; leave it for 3 weeks, then remove it for 1 week.",
      hormones: "Yes (estrogen and progestin).",
      effectiveness: "In typical use, about 93 out of 100 people do not get pregnant in a year. Leaving it out too long lowers protection.",
      duration: "One ring per month.",
      advantages: "Only needs attention once a month; you insert and remove it yourself.",
      sideEffects: "Vaginal discharge or irritation, headaches, breast tenderness.",
      professional: "Yes. A health professional checks whether it is safe for you.",
      sti: NO_STI,
    },
  },
  {
    id: "implant",
    name: "Subdermal implant",
    short: "Tiny flexible rod placed in the arm.",
    target: "arm",
    explain: "A professional places the rod just under the skin of the upper arm, where it releases a hormone.",
    hint: "It goes in a limb, just under the skin.",
    sheet: {
      howItWorks: "Releases progestin that stops ovulation.",
      howUsed: "A professional inserts it under the skin of the inner upper arm with local anesthetic.",
      hormones: "Yes (progestin only).",
      effectiveness: "In typical use, more than 99 out of 100 people do not get pregnant in a year. Some medicines can lower its effect.",
      duration: "Up to 3 years. It can be removed earlier.",
      advantages: "One of the most effective methods; nothing to remember daily.",
      sideEffects: "Irregular or absent periods are common; headaches or acne may occur.",
      professional: "Yes. Insertion and removal are done by a professional.",
      sti: NO_STI,
    },
  },
  {
    id: "injection",
    name: "Contraceptive injection",
    short: "Hormone shot given monthly or every 3 months.",
    target: "injection",
    explain: "It is an injection into a muscle, or under the skin for some formulations, given monthly or every 3 months.",
    hint: "This one is not placed on one body area: think about how a shot is given.",
    sheet: {
      howItWorks: "Hormones stop ovulation.",
      howUsed: "An injection into a muscle (monthly or quarterly) or under the skin (some quarterly formulations).",
      hormones: "Yes (progestin only, or estrogen and progestin in the monthly version).",
      effectiveness: "In typical use, about 96 out of 100 people do not get pregnant in a year. A late injection lowers protection.",
      duration: "Every month or every 3 months, depending on the type.",
      advantages: "Private; nothing to remember daily; offered by public health services.",
      sideEffects: "Changes in periods, weight changes; fertility may take some months to return after stopping.",
      professional: "Yes. Usually given at a health service, on schedule.",
      sti: NO_STI,
    },
  },
  {
    id: "diaphragm",
    name: "Diaphragm",
    short: "Soft dome that covers the cervix.",
    target: "vagina",
    explain: "It is inserted into the vagina and covers the cervix, blocking sperm.",
    hint: "It is inserted through a canal and then covers the cervix — place it on the canal.",
    sheet: {
      howItWorks: "A barrier that covers the cervix so sperm cannot enter the uterus.",
      howUsed: "Insert it into the vagina before sex, often with spermicide; leave it in for at least 6 hours afterwards.",
      hormones: "No hormones.",
      effectiveness: "In typical use, about 83 out of 100 people do not get pregnant in a year. Wrong size or placement lowers protection.",
      duration: "Reusable for about 2 years, used at each sexual act.",
      advantages: "No hormones; used only when needed.",
      sideEffects: "Can raise the chance of urinary infections in some people.",
      professional: "Yes. A professional checks the right size and teaches how to use it.",
      sti: NO_STI,
    },
  },
  {
    id: "sponge",
    name: "Vaginal sponge",
    short: "Soft foam with spermicide.",
    target: "vagina",
    explain: "It is placed deep in the vagina and covers the cervix, releasing spermicide.",
    hint: "Like the diaphragm, it goes through the canal and covers the cervix.",
    note: "Availability depends on the country; it is hard to find in Brazil.",
    sheet: {
      howItWorks: "Covers the cervix and releases spermicide.",
      howUsed: "Wet it, insert it deep into the vagina before sex and leave it in for at least 6 hours afterwards.",
      hormones: "No hormones.",
      effectiveness: "In typical use, about 73 to 86 out of 100 people do not get pregnant in a year (less effective after having given birth).",
      duration: "Single use, up to 24–30 hours.",
      advantages: "No hormones; no prescription where available.",
      sideEffects: "Irritation from spermicide; must not be left in too long.",
      professional: "Not required, but guidance is recommended.",
      sti: NO_STI,
    },
  },
  {
    id: "fertility-awareness",
    name: "Fertility awareness",
    short: "Tracking the cycle to spot fertile days.",
    target: "calendar",
    explain: "These methods track the menstrual cycle (dates, temperature, mucus) to avoid sex or use a barrier on fertile days.",
    hint: "Nothing goes on the body: it is about following the menstrual cycle.",
    sheet: {
      howItWorks: "Identifies fertile days so sex is avoided or a condom is used on those days.",
      howUsed: "Record period dates and other body signs every day, ideally with guidance.",
      hormones: "No hormones.",
      effectiveness: "In typical use, about 77 to 98 out of 100 people do not get pregnant in a year, depending on the method. Much less effective than long-acting methods; irregular cycles, common in adolescence, make it harder.",
      duration: "Daily tracking.",
      advantages: "No hormones or devices; helps you learn about your body.",
      sideEffects: "No physical side effects.",
      professional: "Guidance from a professional is recommended.",
      sti: NO_STI,
    },
  },
];

export const methodById = (id: MethodId) => METHODS.find((m) => m.id === id)!;

export type MatchResult = { result: "correct" | "close" | "wrong"; message: string };

export function checkMatch(methodId: MethodId, targetId: TargetId): MatchResult {
  const method = methodById(methodId);
  if (method.target === targetId) return { result: "correct", message: method.explain };
  if ((methodId === "diaphragm" || methodId === "sponge") && targetId === "cervix") {
    return { result: "close", message: "Close! It covers the cervix, but it is inserted through the vagina. Place it on the vagina." };
  }
  return { result: "wrong", message: method.hint };
}

/** First try earns full points; later tries earn less. Wrong answers never remove points. */
export function pointsFor(wrongAttempts: number) {
  return wrongAttempts === 0 ? 10 : 5;
}

export type QuizQuestion = { q: string; options: string[]; answer: number; explain: string; topic: string };

export const QUIZ: QuizQuestion[] = [
  {
    topic: "Hormonal and non-hormonal methods",
    q: "Which of these methods has NO hormones?",
    options: ["Contraceptive pill", "Copper IUD", "Subdermal implant", "Contraceptive patch"],
    answer: 1,
    explain: "The copper IUD works with copper, not hormones. The pill, implant and patch release hormones. Condoms, the diaphragm and fertility awareness are also hormone-free.",
  },
  {
    topic: "Using condoms correctly",
    q: "What is the right way to use an external condom?",
    options: [
      "Put it on before any genital contact and use a new one every time",
      "Wear two condoms at once for extra protection",
      "Put it on only right before ejaculation",
      "Wash it and reuse it if it looks fine",
    ],
    answer: 0,
    explain: "Put it on the erect penis before any contact and use a new one each time. Never use two at once, or an external and an internal condom together: friction can make them tear.",
  },
  {
    topic: "Long-acting methods",
    q: "Which methods last for years once they are placed?",
    options: ["Pill and patch", "Implant and IUDs", "Condom and diaphragm", "Fertility awareness"],
    answer: 1,
    explain: "The implant and the IUDs (copper and hormonal) are long-acting reversible methods: they last for years and can be removed whenever the person wants.",
  },
  {
    topic: "Preventing unplanned pregnancy",
    q: "Which statement is true?",
    options: [
      "Fertility awareness is as effective as the implant",
      "Long-acting methods, like the implant and IUDs, are among the most effective in typical use",
      "Every method works the same for every person",
      "Effectiveness numbers are a personal guarantee",
    ],
    answer: 1,
    explain: "In typical use, the implant and IUDs prevent more pregnancies than other methods. Effectiveness numbers describe groups of people, not a guarantee for one person. The best method depends on each person's needs and health.",
  },
  {
    topic: "Preventing STIs",
    q: "Which method helps prevent sexually transmitted infections (STIs)?",
    options: ["The pill", "The hormonal IUD", "External or internal condoms", "The injection"],
    answer: 2,
    explain: "Only condoms (external or internal) help prevent STIs. Double protection combines a condom with another contraceptive method.",
  },
];

export const SAFETY_MESSAGES = [
  "External or internal condoms help prevent STIs and pregnancy when used correctly.",
  "Most other contraceptive methods do not protect against STIs.",
  "Double protection can combine a condom with another contraceptive method.",
  "The best method depends on each person's needs, preferences and health.",
  "Visit a health center for confidential guidance that fits your situation.",
];
