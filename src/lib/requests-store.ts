/**
 * Armazenamento SIMULADO de solicitações, em memória da sessão do navegador.
 * Nada é enviado a servidores. Substituir por API segura na integração real.
 */
import { demoRequests, type SupportRequest } from "./data";

let store: SupportRequest[] = [...demoRequests];
let counter = demoRequests.length;

export function listRequests() {
  return store;
}

export function createRequest(input: Pick<SupportRequest, "topic" | "contact" | "city">): SupportRequest {
  counter += 1;
  const req: SupportRequest = {
    ...input,
    id: `SOL-${String(counter).padStart(4, "0")}`,
    createdAt: new Date().toISOString().slice(0, 10),
    status: "Nova",
    notes: [],
  };
  store = [req, ...store];
  return req;
}

export function updateRequest(id: string, patch: Partial<SupportRequest>) {
  store = store.map((r) => (r.id === id ? { ...r, ...patch } : r));
}
