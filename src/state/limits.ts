import type { CardStyle } from "../types/card";

type NumericKey = {
  [K in keyof CardStyle]: CardStyle[K] extends number ? K : never;
}[keyof CardStyle];

export const STYLE_LIMITS: Record<NumericKey, { min: number; max: number; step: number }> = {
  borderWidth: { min: 0.5, max: 6, step: 0.5 },
  radius: { min: 0, max: 48, step: 1 },
  fontSize: { min: 10, max: 22, step: 0.5 },
  titleWeight: { min: 400, max: 700, step: 100 },
  lineHeight: { min: 1, max: 2, step: 0.05 },
  width: { min: 240, max: 1000, step: 2 },
  height: { min: 80, max: 800, step: 2 },
  padding: { min: 8, max: 64, step: 1 },
  gap: { min: 0, max: 40, step: 1 },
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
