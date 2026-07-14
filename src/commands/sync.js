import { syncAdapters } from "../lib/adapters.js";

export async function syncCommand(target, options = {}) {
  return syncAdapters(target, options);
}
