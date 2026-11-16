import { withDistinctColors } from "../lib/svg/theme";
import type {
  CardConfig,
  CardTemplate,
  RenderedCard,
  RenderOptions,
  TemplateId,
} from "../types/card";
import { bannerTemplate } from "./banner";
import { contactTemplate } from "./contact";
import { installTemplate } from "./install";
import { languagesTemplate } from "./languages";
import { nowTemplate } from "./now";
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
  nowTemplate,
  repositoryTemplate,
  installTemplate,
  stackTemplate,
  languagesTemplate,
  quoteTemplate,
] as unknown as CardTemplate<unknown>[];

export function getTemplate(id: TemplateId): CardTemplate<unknown> {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown template: ${id}`);
  return template;
}

/**
 * Render a card. Always go through here rather than `template.render`, so dark
 * mode gets light colours it can tell apart.
 */
export function renderCard(
  template: CardTemplate<unknown>,
  config: CardConfig<unknown>,
  options: RenderOptions,
): RenderedCard {
  const style = withDistinctColors(config.style);
  return template.render(style === config.style ? config : { ...config, style }, options);
}

export function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && TEMPLATES.some((t) => t.id === value);
}
