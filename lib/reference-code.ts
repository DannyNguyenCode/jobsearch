import { randomInt } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRecruiterReferenceCode() {
  let suffix = "";
  for (let index = 0; index < 6; index += 1) {
    suffix += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return `REC-${suffix}`;
}

export function normalizeReferenceCode(value: string) {
  return value.trim().toUpperCase();
}
