import { describe, expect, it } from "vitest";
import { BANK_TYPES_ENUM } from "./types";
import { syncBankShebaAndAccount, validateBankTerminalInput } from "./sync";

describe("syncBankShebaAndAccount", () => {
  it("requires bank for account-only input", () => {
    const result = syncBankShebaAndAccount({ account: "1234567890" });
    expect(result.sheba).toBe("");
    expect(result.error).toContain("بانک");
  });

  it("derives sheba from card when no bank selected", () => {
    const result = syncBankShebaAndAccount({
      account: "1234567890",
      cardNumber: "6037991234567890",
    });
    expect(result.bankType).toBe(BANK_TYPES_ENUM.MELLI);
    expect(result.shebaValid).toBe(true);
  });
});

describe("validateBankTerminalInput", () => {
  it("accepts valid card", () => {
    const result = validateBankTerminalInput({ cardNumber: "6037991234567890" });
    expect(result.ok).toBe(true);
  });

  it("rejects empty input", () => {
    const result = validateBankTerminalInput({});
    expect(result.ok).toBe(false);
  });
});
