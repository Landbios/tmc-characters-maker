export function censorEmail(email: string | null | undefined): string {
  if (!email) return '—';
  
  const parts = email.split('@');
  if (parts.length !== 2) return email;

  const name = parts[0];
  const domain = parts[1];

  if (name.length <= 2) {
    return `${name.charAt(0)}***@${domain}`;
  }

  const visibleChars = Math.min(3, Math.floor(name.length / 2));
  return `${name.slice(0, visibleChars)}***@${domain}`;
}
