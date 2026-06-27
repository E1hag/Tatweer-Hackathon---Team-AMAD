export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function mapAuthError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Email or password is incorrect.';
  }

  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'An account with this email already exists.';
  }

  return message;
}
