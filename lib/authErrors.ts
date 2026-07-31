/** Turns raw Supabase auth error messages into teen-friendly copy. */
export function friendlyAuthError(message: string): string {
  if (/already registered|already exists/i.test(message)) {
    return "That email is already registered — try logging in instead.";
  }
  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password.";
  }
  if (/password/i.test(message) && /least|short|character/i.test(message)) {
    return "Password must be at least 8 characters.";
  }
  if (/email/i.test(message) && /invalid/i.test(message)) {
    return "That doesn't look like a valid email address.";
  }
  if (/rate limit/i.test(message)) {
    return "Too many attempts — please wait a minute and try again.";
  }
  return message;
}
