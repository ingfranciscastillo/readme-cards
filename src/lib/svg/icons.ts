import accessibility from "iconoir/icons/regular/accessibility.svg?raw";
import book from "iconoir/icons/regular/book.svg?raw";
import bugIcon from "iconoir/icons/regular/bug.svg?raw";
import chatBubbleIcon from "iconoir/icons/regular/chat-bubble.svg?raw";
import checkCircle from "iconoir/icons/regular/check-circle.svg?raw";
import cloud from "iconoir/icons/regular/cloud.svg?raw";
import code from "iconoir/icons/regular/code.svg?raw";
import codepen from "iconoir/icons/regular/codepen.svg?raw";
import cpuIcon from "iconoir/icons/regular/cpu.svg?raw";
import database from "iconoir/icons/regular/database.svg?raw";
import discord from "iconoir/icons/regular/discord.svg?raw";
import downloadIcon from "iconoir/icons/regular/download.svg?raw";
import dribbble from "iconoir/icons/regular/dribbble.svg?raw";
import editPencilIcon from "iconoir/icons/regular/edit-pencil.svg?raw";
import eyeClosedIcon from "iconoir/icons/regular/eye-closed.svg?raw";
import flash from "iconoir/icons/regular/flash.svg?raw";
import gamepad from "iconoir/icons/regular/gamepad.svg?raw";
import gitBranchIcon from "iconoir/icons/regular/git-branch.svg?raw";
import gitFork from "iconoir/icons/regular/git-fork.svg?raw";
import github from "iconoir/icons/regular/github.svg?raw";
import gitlab from "iconoir/icons/regular/gitlab-full.svg?raw";
import globe from "iconoir/icons/regular/globe.svg?raw";
import graduationCap from "iconoir/icons/regular/graduation-cap.svg?raw";
import graphUpIcon from "iconoir/icons/regular/graph-up.svg?raw";
import groupIcon from "iconoir/icons/regular/group.svg?raw";
import halfMoonIcon from "iconoir/icons/regular/half-moon.svg?raw";
import headset from "iconoir/icons/regular/headset.svg?raw";
import heartIcon from "iconoir/icons/regular/heart.svg?raw";
import instagram from "iconoir/icons/regular/instagram.svg?raw";
import keyIcon from "iconoir/icons/regular/key.svg?raw";
import laptopIcon from "iconoir/icons/regular/laptop.svg?raw";
import leafIcon from "iconoir/icons/regular/leaf.svg?raw";
import lightBulb from "iconoir/icons/regular/light-bulb.svg?raw";
import link from "iconoir/icons/regular/link.svg?raw";
import linkedin from "iconoir/icons/regular/linkedin.svg?raw";
import lockIcon from "iconoir/icons/regular/lock.svg?raw";
import magicWandIcon from "iconoir/icons/regular/magic-wand.svg?raw";
import mail from "iconoir/icons/regular/mail.svg?raw";
import mapPin from "iconoir/icons/regular/map-pin.svg?raw";
import mastodon from "iconoir/icons/regular/mastodon.svg?raw";
import mediaImageIcon from "iconoir/icons/regular/media-image.svg?raw";
import medium from "iconoir/icons/regular/medium.svg?raw";
import openBook from "iconoir/icons/regular/open-book.svg?raw";
import packageIcon from "iconoir/icons/regular/package.svg?raw";
import page from "iconoir/icons/regular/page.svg?raw";
import palette from "iconoir/icons/regular/palette.svg?raw";
import phone from "iconoir/icons/regular/phone.svg?raw";
import puzzle from "iconoir/icons/regular/puzzle.svg?raw";
import refreshDoubleIcon from "iconoir/icons/regular/refresh-double.svg?raw";
import rocketIcon from "iconoir/icons/regular/rocket.svg?raw";
import searchIcon from "iconoir/icons/regular/search.svg?raw";
import serverIcon from "iconoir/icons/regular/server.svg?raw";
import settingsIcon from "iconoir/icons/regular/settings.svg?raw";
import shieldCheck from "iconoir/icons/regular/shield-check.svg?raw";
import sparks from "iconoir/icons/regular/sparks.svg?raw";
import star from "iconoir/icons/regular/star.svg?raw";
import telegram from "iconoir/icons/regular/telegram.svg?raw";
import terminalIcon from "iconoir/icons/regular/terminal.svg?raw";
import testTubeIcon from "iconoir/icons/regular/test-tube.svg?raw";
import textIcon from "iconoir/icons/regular/text.svg?raw";
import threads from "iconoir/icons/regular/threads.svg?raw";
import timerIcon from "iconoir/icons/regular/timer.svg?raw";
import translateIcon from "iconoir/icons/regular/translate.svg?raw";
import trophyIcon from "iconoir/icons/regular/trophy.svg?raw";
import viewGridIcon from "iconoir/icons/regular/view-grid.svg?raw";
import wifiOffIcon from "iconoir/icons/regular/wifi-off.svg?raw";
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
  rocket: inner(rocketIcon),
  timer: inner(timerIcon),
  refreshDouble: inner(refreshDoubleIcon),
  leaf: inner(leafIcon),
  trophy: inner(trophyIcon),
  lock: inner(lockIcon),
  key: inner(keyIcon),
  eyeClosed: inner(eyeClosedIcon),
  terminal: inner(terminalIcon),
  gitBranch: inner(gitBranchIcon),
  bug: inner(bugIcon),
  settings: inner(settingsIcon),
  cpu: inner(cpuIcon),
  testTube: inner(testTubeIcon),
  magicWand: inner(magicWandIcon),
  viewGrid: inner(viewGridIcon),
  text: inner(textIcon),
  mediaImage: inner(mediaImageIcon),
  editPencil: inner(editPencilIcon),
  translate: inner(translateIcon),
  halfMoon: inner(halfMoonIcon),
  server: inner(serverIcon),
  download: inner(downloadIcon),
  search: inner(searchIcon),
  wifiOff: inner(wifiOffIcon),
  laptop: inner(laptopIcon),
  graphUp: inner(graphUpIcon),
  group: inner(groupIcon),
  chatBubble: inner(chatBubbleIcon),
  heart: inner(heartIcon),
  flash: inner(flash),
  shieldCheck: inner(shieldCheck),
  puzzle: inner(puzzle),
  palette: inner(palette),
  database: inner(database),
  cloud: inner(cloud),
  phone: inner(phone),
  package: inner(packageIcon),
  accessibility: inner(accessibility),
  checkCircle: inner(checkCircle),
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
