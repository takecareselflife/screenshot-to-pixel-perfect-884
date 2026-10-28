// Explicit opt-in: disposable accounts only; never runs against existing user records.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const enabled = process.env["RUN_SECURITY_INTEGRATION"] === "1";
describe.skipIf(!enabled)("live professional RLS with disposable synthetic accounts", () => {
  const url = process.env["SUPABASE_URL"] ?? "";
  const adminKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
  const publicKey = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "";
  const admin = createClient<Database>(url || "http://localhost", adminKey || "disabled", { auth: { persistSession:false, storageKey:"care-security-operator" }, global: { fetch: (input,init) => {
    const h=new Headers(init?.headers); if(h.get("Authorization")===`Bearer ${adminKey}`) h.delete("Authorization"); h.set("apikey",adminKey); return fetch(input,{...init,headers:h});
  } } });
  const ids: string[] = [];
  const accounts: { id:string; client:SupabaseClient<Database> }[] = [];
  const owner = () => { const a=accounts[0]; if(!a) throw new Error("Missing synthetic owner"); return a; };
  const operator = () => { const a=accounts[1]; if(!a) throw new Error("Missing synthetic administrator"); return a; };
  beforeAll(async () => {
    if(!url || !adminKey || !publicKey) throw new Error("Integration environment is unavailable");
    for(let i=0;i<2;i++) {
      const password=crypto.randomUUID()+crypto.randomUUID();
      const email=`care-security-${crypto.randomUUID()}@example.com`;
      const created=await admin.auth.admin.createUser({email,password,email_confirm:true});
      if(created.error || !created.data.user) throw new Error("Synthetic setup failed");
      ids.push(created.data.user.id);
      const client=createClient<Database>(url,publicKey,{auth:{persistSession:false,storageKey:`care-security-${i}`},global:{fetch:(input,init)=>{
        const h=new Headers(init?.headers); if(h.get("Authorization")===`Bearer ${publicKey}`) h.delete("Authorization"); h.set("apikey",publicKey);return fetch(input,{...init,headers:h});
      }}});
      const login=await client.auth.signInWithPassword({email,password});
      if(login.error) throw new Error("Synthetic sign-in failed");
      accounts.push({id:created.data.user.id,client});
    }
  },60000);
  afterAll(async () => {
    for(const a of accounts) await a.client.auth.signOut();
    for(const id of ids) {
      await admin.auth.admin.deleteUser(id);
      await admin.from("security_audit").delete().or(`actor_id.eq.${id},subject_id.eq.${id}`);
    }
  },60000);
  it("signup trigger creates a private pending profile without privileges",async()=>{
    const result=await owner().client.rpc("professional_session");
    expect(result.data).toMatchObject({status:"pending",roles:[],admin:false});
  });
  it("another account cannot read or update the owner profile",async()=>{
    const read=await operator().client.from("profiles").select("*").eq("id",owner().id);
    expect(read.data).toEqual([]);
    await operator().client.from("profiles").update({display_name:"ATTACK"}).eq("id",owner().id);
    const mine=await owner().client.from("profiles").select("display_name").single();
    expect(mine.data?.display_name).toBe("");
  });
  it("owners cannot grant roles, approval or administrator status",async()=>{
    expect((await owner().client.from("user_roles").insert({user_id:owner().id,role:"manager"})).error).not.toBeNull();
    expect((await owner().client.from("professional_access").insert({user_id:owner().id,status:"approved"})).error).not.toBeNull();
    expect((await owner().client.from("admin_authorizations").insert({user_id:owner().id,active:true})).error).not.toBeNull();
    expect((await owner().client.rpc("manage_professional",{_target:operator().id,_status:"approved",_roles:["manager"]})).data).toMatchObject({error:"forbidden"});
  });
  it("explicit admin approval is audited and allows only assigned resources",async()=>{
    await owner().client.from("profiles").update({display_name:"Synthetic test",registration:"TEST-ONLY"}).eq("id",owner().id);
    await admin.from("admin_authorizations").insert({user_id:operator().id,active:true});
    const changed=await operator().client.rpc("manage_professional",{_target:owner().id,_status:"approved",_roles:["professional"]});
    expect(changed.data).toMatchObject({ok:true});
    expect((await owner().client.rpc("authorize_professional",{_area:"intake"})).data).toMatchObject({ok:true});
    expect((await owner().client.rpc("authorize_professional",{_area:"indicators"})).data).toMatchObject({error:"forbidden"});
    const audit=await operator().client.from("security_audit").select("actor_id,occurred_at,details").eq("subject_id",owner().id).eq("action","professional_access_changed");
    expect(audit.data?.some((r)=>r.actor_id===operator().id && r.occurred_at && typeof r.details === "object" && r.details !== null && !Array.isArray(r.details) && r.details["status"]==="approved")).toBe(true);
  });
  it("suspension immediately blocks the still-open authenticated session",async()=>{
    await operator().client.rpc("manage_professional",{_target:owner().id,_status:"suspended",_roles:[]});
    expect((await owner().client.rpc("authorize_professional",{_area:"intake"})).data).toMatchObject({error:"forbidden"});
    const edit=await owner().client.from("profiles").update({display_name:"Changed"}).eq("id",owner().id).select("id");
    expect(edit.data).toEqual([]);
  });
  it("a suspended account stays blocked until an authorized administrator reactivates it",async()=>{
    expect((await owner().client.rpc("manage_professional",{_target:owner().id,_status:"approved",_roles:["professional"]})).data).toMatchObject({error:"forbidden"});
    expect((await owner().client.rpc("authorize_professional",{_area:"intake"})).data).toMatchObject({error:"forbidden"});
    await admin.from("admin_authorizations").update({active:false}).eq("user_id",operator().id);
    expect((await operator().client.rpc("manage_professional",{_target:owner().id,_status:"approved",_roles:["professional"]})).data).toMatchObject({error:"forbidden"});
    await admin.from("admin_authorizations").update({active:true}).eq("user_id",operator().id);
  });
  it("reactivation grants only the assigned role and is audited without profile contents",async()=>{
    expect((await operator().client.rpc("manage_professional",{_target:owner().id,_status:"approved",_roles:["professional"]})).data).toMatchObject({ok:true});
    expect((await owner().client.rpc("authorize_professional",{_area:"intake"})).data).toMatchObject({ok:true});
    expect((await owner().client.rpc("authorize_professional",{_area:"indicators"})).data).toMatchObject({error:"forbidden"});
    expect((await owner().client.rpc("professional_session")).data).toMatchObject({status:"approved",admin:false});
    const audit=await operator().client.from("security_audit").select("details").eq("subject_id",owner().id).eq("action","professional_access_changed");
    const statuses=(audit.data??[]).map((r)=>(r.details as Record<string,unknown>|null)?.["status"]);
    expect(statuses).toEqual(expect.arrayContaining(["approved","suspended"]));
    const text=JSON.stringify(audit.data);
    expect(text).not.toContain("Synthetic test");
    expect(text).not.toContain("TEST-ONLY");
  });
  it("administrators cannot self-approve and ordinary users cannot read audit",async()=>{
    expect((await operator().client.rpc("manage_professional",{_target:operator().id,_status:"approved",_roles:["professional"]})).data).toMatchObject({error:"forbidden"});
    expect((await owner().client.from("security_audit").select("*")).data).toEqual([]);
  });
});