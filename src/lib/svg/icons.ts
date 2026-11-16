import book from "iconoir/icons/regular/book.svg?raw";
import code from "iconoir/icons/regular/code.svg?raw";
import codepen from "iconoir/icons/regular/codepen.svg?raw";
import discord from "iconoir/icons/regular/discord.svg?raw";
import dribbble from "iconoir/icons/regular/dribbble.svg?raw";
import gamepad from "iconoir/icons/regular/gamepad.svg?raw";
import gitFork from "iconoir/icons/regular/git-fork.svg?raw";
import github from "iconoir/icons/regular/github.svg?raw";
import gitlab from "iconoir/icons/regular/gitlab-full.svg?raw";
import globe from "iconoir/icons/regular/globe.svg?raw";
import graduationCap from "iconoir/icons/regular/graduation-cap.svg?raw";
import headset from "iconoir/icons/regular/headset.svg?raw";
import instagram from "iconoir/icons/regular/instagram.svg?raw";
import lightBulb from "iconoir/icons/regular/light-bulb.svg?raw";
import link from "iconoir/icons/regular/link.svg?raw";
import linkedin from "iconoir/icons/regular/linkedin.svg?raw";
import mail from "iconoir/icons/regular/mail.svg?raw";
import mapPin from "iconoir/icons/regular/map-pin.svg?raw";
import mastodon from "iconoir/icons/regular/mastodon.svg?raw";
import medium from "iconoir/icons/regular/medium.svg?raw";
import openBook from "iconoir/icons/regular/open-book.svg?raw";
import page from "iconoir/icons/regular/page.svg?raw";
import sparks from "iconoir/icons/regular/sparks.svg?raw";
import star from "iconoir/icons/regular/star.svg?raw";
import telegram from "iconoir/icons/regular/telegram.svg?raw";
import threads from "iconoir/icons/regular/threads.svg?raw";
import x from "iconoir/icons/regular/x.svg?raw";
import youtube from "iconoir/icons/regular/youtube.svg?raw";
import quote from "iconoir/icons/solid/quote.svg?raw";
import { raw, type SafeSvg, svg } from "./markup";

/** Strip the outer <svg> so the bundled Iconoir paths can be nested as a <g>. */
function inner(source: string): string {
  return source
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/\s*\n\s*/g, "")
    .trim();
}

const ICONS = {
  book: inner(book),
  code: inner(code),
  gamepad: inner(gamepad),
  graduationCap: inner(graduationCap),
  headset: inner(headset),
  lightBulb: inner(lightBulb),
  openBook: inner(openBook),
  sparks: inner(sparks),
  codepen: inner(codepen),
  discord: inner(discord),
  dribbble: inner(dribbble),
  fork: inner(gitFork),
  github: inner(github),
  gitlab: inner(gitlab),
  globe: inner(globe),
  instagram: inner(instagram),
  link: inner(link),
  linkedin: inner(linkedin),
  mail: inner(mail),
  pin: inner(mapPin),
  mastodon: inner(mastodon),
  medium: inner(medium),
  page: inner(page),
  star: inner(star),
  telegram: inner(telegram),
  threads: inner(threads),
  x: inner(x),
  youtube: inner(youtube),
  quote: inner(quote),
} as const;

export type IconName = keyof typeof ICONS;

/** Place a 24×24 Iconoir icon at (x, y) scaled to `size`, coloured via currentColor. */
export function icon(
  name: IconName,
  x: number,
  y: number,
  size: number,
  color: string,
  opacity = 1,
): SafeSvg {
  const scale = size / 24;
  return svg`<g transform="translate(${x} ${y}) scale(${Math.round(scale * 1000) / 1000})" color="${color}" fill="none" stroke-width="1.5"${
    opacity < 1 ? svg` opacity="${opacity}"` : ""
  }>${raw(ICONS[name])}</g>`;
}
