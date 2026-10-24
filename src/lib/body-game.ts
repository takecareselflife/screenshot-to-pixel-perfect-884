export type TrafficColor = "green" | "yellow" | "red";

export const BODY_REGIONS = [
  { id: "head", label: "Head and hair", color: "green" },
  { id: "face", label: "Face", color: "yellow" },
  { id: "shoulders", label: "Shoulders", color: "green" },
  { id: "arms", label: "Arms and hands", color: "green" },
  { id: "chest", label: "Chest", color: "red" },
  { id: "abdomen", label: "Abdomen", color: "yellow" },
  { id: "private", label: "Genitals (private parts)", color: "red" },
  { id: "buttocks", label: "Buttocks", color: "red" },
  { id: "upperBack", label: "Upper back", color: "green" },
  { id: "lowerBack", label: "Lower back", color: "yellow" },
  { id: "thighs", label: "Thighs", color: "yellow" },
  { id: "legs", label: "Lower legs", color: "green" },
  { id: "feet", label: "Feet", color: "green" },
] as const;

export type RegionId = (typeof BODY_REGIONS)[number]["id"];
export const PRIVATE_REGIONS: RegionId[] = ["chest", "private", "buttocks"];
export const matchesBodyColor = (region: RegionId, color: TrafficColor) =>
  BODY_REGIONS.some((item) => item.id === region && item.color === color);
