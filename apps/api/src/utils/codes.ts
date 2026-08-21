/**
 * Human-friendly reservation code, e.g. `APC-2026-00021`.
 */
export function reservationCode(seq: number, year: number = new Date().getFullYear()): string {
  return `APC-${year}-${String(seq).padStart(5, '0')}`;
}

/**
 * Short, unambiguous access code used by the QR / access simulator,
 * e.g. `7F3K9Q`. Excludes easily-confused characters (0/O, 1/I).
 */
export function accessCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
