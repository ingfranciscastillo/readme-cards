import type { CardStyle } from "../../types/card";

export interface ColorPreset {
  id: string;
  label: string;
  colors: Pick<CardStyle, "background" | "text" | "accent" | "border" | "transparent">;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "paper",
    label: "Paper",
    colors: {
      background: "#f6f6f2",
      text: "#202124",
      accent: "#246b68",
      border: "#dcdcd3",
      transparent: false,
    },
  },
  {
    id: "chalk",
    label: "Chalk",
    colors: {
      background: "#ffffff",
      text: "#1d1f23",
      accent: "#2f5bd3",
      border: "#e1e3e6",
      transparent: false,
    },
  },
  {
    id: "ink",
    label: "Ink",
    colors: {
      background: "#18191b",
      text: "#ecece6",
      accent: "#7cc2bc",
      border: "#2e3033",
      transparent: false,
    },
  },
  {
    id: "night",
    label: "Night",
    colors: {
      background: "#0e1217",
      text: "#e4e8ee",
      accent: "#e0a458",
      border: "#262c35",
      transparent: false,
    },
  },
  {
    id: "teal",
    label: "Teal",
    colors: {
      background: "#246b68",
      text: "#f6f6f2",
      accent: "#f1d58a",
      border: "#1b5250",
      transparent: false,
    },
  },
  {
    id: "clear",
    label: "Clear",
    colors: {
      background: "#f6f6f2",
      text: "#7d8086",
      accent: "#246b68",
      border: "#8b8e93",
      transparent: true,
    },
  },
];

export interface DarkPreset {
  id: string;
  label: string;
  colors: Pick<CardStyle, "darkBackground" | "darkText" | "darkAccent" | "darkBorder">;
}

/** Palettes for a card's dark-mode colours. */
export const DARK_PRESETS: DarkPreset[] = [
  {
    id: "ink",
    label: "Ink",
    colors: {
      darkBackground: "#18191b",
      darkText: "#ecece6",
      darkAccent: "#7cc2bc",
      darkBorder: "#2e3033",
    },
  },
  {
    id: "night",
    label: "Night",
    colors: {
      darkBackground: "#0e1217",
      darkText: "#e4e8ee",
      darkAccent: "#e0a458",
      darkBorder: "#262c35",
    },
  },
  {
    id: "github",
    label: "GitHub",
    colors: {
      darkBackground: "#0d1117",
      darkText: "#e6edf3",
      darkAccent: "#4493f8",
      darkBorder: "#30363d",
    },
  },
];
