import type { CardTemplate, TemplateId } from "../types/card";
import { bannerTemplate } from "./banner";
import { contactTemplate } from "./contact";
import { languagesTemplate } from "./languages";
import { profileTemplate } from "./profile";
import { quoteTemplate } from "./quote";
import { repositoryTemplate } from "./repository";
import { stackTemplate } from "./stack";

/**
 * Template registry. Each entry is typed against its own content; the
 * registry erases the content type so the editor can treat them uniformly.
 */
export const TEMPLATES = [
  profileTemplate,
  bannerTemplate,
  contactTemplate,
  repositoryTemplate,
  stackTemplate,
  languagesTemplate,
  quoteTemplate,
] as unknown as CardTemplate<unknown>[];

export function getTemplate(id: TemplateId): CardTemplate<unknown> {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown template: ${id}`);
  return template;
}

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && TEMPLATES.some((t) => t.id === value);
}
