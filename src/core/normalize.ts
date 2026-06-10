import type { BankInputKind } from "./types";

export function normalizeDigits(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .trim()
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[\s\-_./]/g, "");
}

export function normalizeCardNumber(value: unknown): string {
  return normalizeDigits(value).replace(/\D/g, "");
}

export function normalizeSheba(value: unknown): string {
  let raw = normalizeDigits(value).toUpperCase();
  if (raw.startsWith("IR")) raw = raw.slice(2);
  raw = raw.replace(/\D/g, "");
  if (raw.length === 24) return `IR${raw}`;
  if (raw.length === 26 && raw.startsWith("IR")) return raw;
  return raw.length === 24 ? `IR${raw}` : raw.startsWith("IR") ? raw : raw ? `IR${raw}` : "";
}

export function formatShebaDisplay(sheba: unknown): string {
  const n = normalizeSheba(sheba);
  if (!/^IR\d{24}$/.test(n)) return normalizeDigits(sheba);
  const body = n.slice(2);
  return `IR${body.slice(0, 2)} ${body.slice(2, 6)} ${body.slice(6, 10)} ${body.slice(10, 14)} ${body.slice(14, 18)} ${body.slice(18, 22)} ${body.slice(22, 24)}`;
}

export function detectBankInputKind(value: unknown): BankInputKind {
  const raw = normalizeDigits(value);
  if (!raw) return "unknown";
  const upper = String(value ?? "").toUpperCase();
  if (upper.includes("IR") || raw.length >= 22) return "sheba";
  if (raw.length >= 6 && raw.length <= 19) return "account";
  return "unknown";
}

export function separateCardNumber(card: string): string {
  const n = normalizeCardNumber(card);
  if (n.length !== 16) return "";
  return n.match(/.{1,4}/g)?.join("-") ?? "";
}
