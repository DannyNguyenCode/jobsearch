import { createHash, randomInt, timingSafeEqual } from "crypto";

const CODE_TTL_MINUTES = 15;

export function generateSixDigitCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function newEmailCode() {
  const code = generateSixDigitCode();
  return { code, hash: hashToken(code), expires: minutesFromNow(CODE_TTL_MINUTES) };
}

export function isCodeValid(code: string, hash?: string | null, expires?: Date | null) {
  if (!hash || !expires) return false;
  if (expires.getTime() < Date.now()) return false;
  const expected = Buffer.from(hash);
  const actual = Buffer.from(hashToken(code));
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
