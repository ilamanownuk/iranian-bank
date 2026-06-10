import { normalizeDigits, normalizeSheba } from "./normalize";

function mod97(numeric: string): number {
  let remainder = "";
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = String(Number(remainder + numeric.slice(i, i + 7)) % 97);
  }
  return Number(remainder);
}

export function validateIranSheba(sheba: unknown): boolean {
  const normalized = normalizeSheba(sheba);
  if (!/^IR\d{24}$/.test(normalized)) return false;
  const rearranged = `${normalized.slice(4)}1827${normalized.slice(2, 4)}`;
  return mod97(rearranged) === 1;
}

function computeShebaCheckDigits(bban: string): string {
  const check = 98 - mod97(`${bban}182700`);
  return check.toString().padStart(2, "0");
}

export function extractShebaBankCode(sheba: unknown): string | null {
  const n = normalizeSheba(sheba);
  if (!/^IR\d{24}$/.test(n)) return null;
  return n.slice(4, 7);
}

export function shebaToAccountNumber(sheba: unknown, { trimZeros = true } = {}): string | null {
  const n = normalizeSheba(sheba);
  if (!/^IR\d{24}$/.test(n)) return null;
  const padded = n.slice(7);
  if (!trimZeros) return padded;
  return padded.replace(/^0+/, "") || "0";
}

export function accountNumberToSheba(account: unknown, bankCode: string): string | null {
  const digits = normalizeDigits(account).replace(/\D/g, "");
  if (!digits || !bankCode) return null;
  const code = bankCode.padStart(3, "0").slice(-3);
  const paddedAccount = digits.padStart(19, "0");
  if (paddedAccount.length !== 19) return null;
  const bban = `${code}${paddedAccount}`;
  const check = computeShebaCheckDigits(bban);
  return `IR${check}${bban}`;
}
