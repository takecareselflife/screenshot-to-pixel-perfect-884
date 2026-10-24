export const STI_QUESTIONS = [
  { topic: "No symptoms", statement: "A person can have an STI without any symptoms.", answer: true, explanation: "Many STIs cause no symptoms but can still be transmitted and cause complications. Testing and prevention matter." },
  { topic: "Genital lesions", statement: "If a genital sore, wart or unusual lesion appears, just wait for it to disappear without seeking care.", answer: false, explanation: "Genital lesions have different causes and need assessment by a health professional. Seek care rather than waiting or treating yourself." },
  { topic: "Rapid tests", statement: "Rapid tests at health services can help detect some STIs even without symptoms.", answer: true, explanation: "Depending on the test available, rapid tests can detect HIV, syphilis and hepatitis B or C. A recent exposure may require repeat testing or other examinations because infections are not always detectable immediately." },
  { topic: "Condoms", statement: "Using condoms correctly helps prevent several STIs, even when a person appears healthy.", answer: true, explanation: "External or internal condoms reduce the risk of several STIs. Protection is not complete for infections spread through skin not covered by the condom, such as HPV and herpes." },
  { topic: "Early treatment", statement: "Diagnosing and treating an STI early can reduce complications and help prevent transmission.", answer: true, explanation: "Appropriate diagnosis and treatment reduce complications and can interrupt transmission of many STIs. Sexual partners may also need guidance, testing and treatment." },
  { topic: "HPV vaccination", statement: "HPV vaccination helps prevent cancers related to the virus and, depending on the vaccine, most genital warts caused by the types it covers.", answer: true, explanation: "HPV vaccination prevents infections that can cause cancer. Vaccines that include wart-causing types also protect against most genital warts. Vaccination works best before exposure to HPV." },
  { topic: "Treatment and cure", statement: "All STIs can be cured, including HIV and genital herpes.", answer: false, explanation: "Some STIs, such as syphilis and chlamydia, can be cured with appropriate treatment. HIV and genital herpes currently have no routinely available cure, but treatment and follow-up can control them." },
  { topic: "HIV: U=U", statement: "A person living with HIV who stays on effective treatment and maintains an undetectable viral load does not transmit HIV through sex.", answer: true, explanation: "A sustained undetectable viral load with effective treatment prevents sexual HIV transmission. This is U=U: Undetectable = Untransmittable. Ongoing treatment and viral-load monitoring are essential; this does not prevent other STIs." },
  { topic: "Testing matters", statement: "Having no discharge, genital sores or pain means a person does not have an STI.", answer: false, explanation: "No symptoms does not rule out an infection. A health professional can advise on testing based on practices, possible exposures and the timing of tests." },
  { topic: "Combined prevention", statement: "STI prevention can include condoms, vaccination, testing, treatment and other measures suited to each situation.", answer: true, explanation: "Combined prevention brings together different strategies. A health professional can offer guidance suited to each adolescent, including HIV PrEP or PEP when appropriate." },
] as const;

export type StiGameState = { position: number; attempts: number; correct: number; answered: boolean; lastCorrect: boolean | null };
export const initialStiState = (): StiGameState => ({ position: 0, attempts: 0, correct: 0, answered: false, lastCorrect: null });
export function answerSti(state: StiGameState, answer: boolean): StiGameState {
  if (state.answered || state.position >= STI_QUESTIONS.length) return state;
  const question = STI_QUESTIONS[state.position];
  if (!question) return state;
  const correct = answer === question.answer;
  return { ...state, attempts: state.attempts + 1, correct: state.correct + Number(correct), answered: true, lastCorrect: correct };
}
export function continueSti(state: StiGameState): StiGameState {
  if (!state.answered) return state;
  return { ...state, position: state.position + Number(state.lastCorrect), answered: false, lastCorrect: null };
}
export const stiAccuracy = (state: StiGameState) => state.attempts ? Math.round(state.correct / state.attempts * 100) : 0;