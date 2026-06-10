import { describe, expect, it } from "vitest";
import { getBankTypeByCard, getBankTypeBySheba } from "./registry";
import { normalizeSheba, formatShebaDisplay } from "./normalize";
import { accountNumberToSheba, shebaToAccountNumber, validateIranSheba } from "./sheba";
import { BANK_TYPES_ENUM } from "./types";
import { syncBankShebaAndAccount } from "./sync";

describe("validateIranSheba", () => {
  it("rejects invalid IBAN", () => {
    expect(validateIranSheba("IR000000000000000000000000")).toBe(false);
    expect(validateIranSheba("invalid")).toBe(false);
    expect(validateIranSheba("")).toBe(false);
  });

  it("validates IBAN produced by accountNumberToSheba", () => {
    const sheba = accountNumberToSheba("1234567890", "017");
    expect(sheba).toBeTruthy();
    expect(validateIranSheba(sheba!)).toBe(true);
  });
});

describe("sheba ↔ account roundtrip", () => {
  it("roundtrips account number", () => {
    const account = "1234567890";
    const sheba = accountNumberToSheba(account, "017");
    expect(sheba).toMatch(/^IR\d{24}$/);
    expect(shebaToAccountNumber(sheba!)).toBe(account);
  });

  it("syncs sheba from account when bank is selected", () => {
    const result = syncBankShebaAndAccount({
      account: "1234567890",
      bankType: BANK_TYPES_ENUM.MELLI,
    });
    expect(result.shebaValid).toBe(true);
    expect(result.account).toBe("1234567890");
    expect(result.bankType).toBe(BANK_TYPES_ENUM.MELLI);
  });
});

describe("normalizeSheba", () => {
  it("normalizes Persian digits and spacing", () => {
    const sheba = accountNumberToSheba("1234567890", "017")!;
    const spaced = formatShebaDisplay(sheba);
    expect(normalizeSheba(spaced)).toBe(sheba);
    expect(normalizeSheba("ir" + sheba.slice(2).replace(/(\d{4})/g, " $1").trim())).toBe(sheba);
  });

  it("formats display with spaces", () => {
    const sheba = accountNumberToSheba("1", "017");
    expect(sheba).toBeTruthy();
    const formatted = formatShebaDisplay(sheba!);
    expect(formatted).toContain(" ");
    expect(formatted.startsWith("IR")).toBe(true);
  });
});

describe("card detection", () => {
  it("detects Melli by card prefix", () => {
    expect(getBankTypeByCard("6037991234567890")).toBe(BANK_TYPES_ENUM.MELLI);
  });

  it("detects bank from sheba code", () => {
    const sheba = accountNumberToSheba("1234567890", "017");
    expect(getBankTypeBySheba(sheba!)).toBe(BANK_TYPES_ENUM.MELLI);
  });
});
