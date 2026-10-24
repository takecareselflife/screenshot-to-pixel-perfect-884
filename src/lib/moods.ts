/** Mood choices open a reflection topic, never assign answers or a diagnosis. */
export const moods = [
  { id: "happy", emoji: "😊", label: "Happy", questionnaire: "humor" },
  { id: "okay", emoji: "😐", label: "Okay", questionnaire: "humor" },
  { id: "sad", emoji: "😢", label: "Sad", questionnaire: "humor" },
  { id: "anxious", emoji: "😟", label: "Anxious", questionnaire: "ansiedade" },
  { id: "tired", emoji: "😴", label: "Tired", questionnaire: "sono" },
  { id: "lonely", emoji: "🥺", label: "Lonely", questionnaire: "relacoes" },
] as const;