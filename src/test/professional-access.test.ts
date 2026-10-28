import { describe, expect, it } from "vitest";
import { canAccess, manageSchema, profileSchema, safeRedirect, type ProfessionalSession } from "@/lib/professional-schemas";

const account = (status: ProfessionalSession["status"], roles: ProfessionalSession["roles"] = ["professional"]): ProfessionalSession => ({ status, roles, admin:false });
describe("professional permissions", () => {
  it("ordinary users cannot access professional resources", () => { expect(canAccess(account("ordinary"),"intake")).toBe(false); });
  it("pending users cannot access professional resources", () => { expect(canAccess(account("pending"),"intake")).toBe(false); });
  it("suspended users lose access even with existing roles", () => { expect(canAccess(account("suspended"),"intake")).toBe(false); });
  it("revoked users lose access even with existing roles", () => { expect(canAccess(account("revoked"),"intake")).toBe(false); });
  it("approved professionals have intake but not manager or admin access", () => {
    const a=account("approved"); expect(canAccess(a,"intake")).toBe(true); expect(canAccess(a,"indicators")).toBe(false); expect(canAccess(a,"administration")).toBe(false);
  });
  it("managers cannot access intake or become administrators", () => {
    const a=account("approved",["manager"]); expect(canAccess(a,"indicators")).toBe(true); expect(canAccess(a,"intake")).toBe(false); expect(canAccess(a,"administration")).toBe(false);
  });
  it("administrative designation does not confer clinical or manager access", () => {
    const a={...account("pending",[]),admin:true}; expect(canAccess(a,"administration")).toBe(true); expect(canAccess(a,"intake")).toBe(false); expect(canAccess(a,"indicators")).toBe(false);
  });
  it("profile updates cannot include roles, account IDs or approval status", () => {
    expect(profileSchema.safeParse({display_name:"Synthetic",registration:"TEST-123",role:"manager"}).success).toBe(false);
    expect(profileSchema.safeParse({display_name:"Synthetic",registration:"TEST-123",id:"other",status:"approved"}).success).toBe(false);
  });
  it("approval accepts only the explicit resource roles", () => {
    expect(manageSchema.safeParse({target:"00000000-0000-4000-8000-000000000001",status:"approved",roles:["admin"]}).success).toBe(false);
    expect(manageSchema.safeParse({target:"00000000-0000-4000-8000-000000000001",status:"approved",roles:[]}).success).toBe(false);
  });
  it("redirects stay on same-origin paths", () => {
    expect(safeRedirect("//external.test")).toBe("/profissionais");
    expect(safeRedirect("/\\external.test")).toBe("/profissionais");
    expect(safeRedirect("https://external.test")).toBe("/profissionais");
    expect(safeRedirect("/conta")).toBe("/conta");
  });
});