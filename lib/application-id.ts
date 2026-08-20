import { randomInt } from "crypto";

export const APPLICATION_ID_PREFIX = "APP";
export const APPLICATION_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const APPLICATION_ID_LENGTH = 6;
export const APPLICATION_ID_PATTERN = /^APP-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export function generateApplicationId() {
  let suffix = "";
  for (let index = 0; index < APPLICATION_ID_LENGTH; index += 1) {
    suffix += APPLICATION_ID_ALPHABET[randomInt(0, APPLICATION_ID_ALPHABET.length)];
  }
  return `${APPLICATION_ID_PREFIX}-${suffix}`;
}

export function isApplicationId(value: string) {
  return APPLICATION_ID_PATTERN.test(value.trim().toUpperCase());
}
