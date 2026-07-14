import { validateProject } from "../lib/validate.js";

export async function validateCommand(target, options = {}) {
  return validateProject(target, options);
}
