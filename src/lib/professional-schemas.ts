import { z } from "zod";

export const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(100),
  registration: z.string().trim().min(1).max(80),
}).strict();
export const areaSchema = z.enum(["intake", "indicators", "administration"]);
export const manageSchema = z.object({
  target: z.string().uuid(),
  status: z.enum(["approved", "suspended", "revoked"]),
  roles: z.array(z.enum(["professional", "manager"])).max(2),
}).strict().refine((v) => v.status !== "approved" || v.roles.length > 0);
export const sessionSchema = z.object({
  status: z.enum(["ordinary", "pending", "approved", "suspended", "revoked"]),
  admin: z.boolean(),
  roles: z.array(z.enum(["professional", "manager"])),
  profile: z.object({ display_name: z.string().max(100), registration: z.string().max(80) }).optional(),
});
export type ProfessionalSession = z.infer<typeof sessionSchema>;
export const recordSchema = z.object({
  id: z.string().uuid(), display_name: z.string(), registration: z.string(),
  status: z.string(), roles: z.array(z.enum(["professional", "manager"])),
});
export type ProfessionalRecord = z.infer<typeof recordSchema>;

export function canAccess(session: ProfessionalSession, area: z.infer<typeof areaSchema>): boolean {
  if (area === "administration") return session.admin;
  return session.status === "approved" && session.roles.includes(area === "intake" ? "professional" : "manager");
}

export function safeRedirect(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/profissionais";
  return value;
}