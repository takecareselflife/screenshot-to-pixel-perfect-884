/** Browser-safe budget constants shared by the server controls and the monitoring panel. */
export type PaidScope = "assistant" | "voice" | "speech";

/** Assumed conservative credits per call. NOT yet checked against provider usage records; review before the pilot. */
export const EST_COST: Record<PaidScope, number> = { assistant: 0.05, voice: 0.03, speech: 0.03 };
/** Daily estimated-credit ceilings per service and for the whole app; reset at 00:00 UTC. */
export const DAILY_BUDGET: Record<PaidScope, number> = { assistant: 150, voice: 30, speech: 60 };
export const TOTAL_DAILY_BUDGET = 200;

