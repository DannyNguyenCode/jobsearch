export const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60;
export const TEMP_MAX_AGE = 12 * 60 * 60;

export function isRememberDevice(remember?: string) {
  return remember !== "false";
}

export function sessionMaxAgeSeconds(staySignedIn: boolean) {
  return staySignedIn ? REMEMBER_MAX_AGE : TEMP_MAX_AGE;
}
