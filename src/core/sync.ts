import { resolveShebaBankCode } from "./identity";
import { detectBankInputKind, normalizeDigits, normalizeSheba, normalizeCardNumber } from "./normalize";
import { accountNumberToSheba, extractShebaBankCode, shebaToAccountNumber, validateIranSheba } from "./sheba";
import { getBankId, getBankTypeBySheba, SHEBA_CODE_MAP } from "./registry";
import { BANK_TYPES_ENUM, type SyncBankFieldsInput, type SyncBankFieldsResult } from "./types";

export function syncBankShebaAndAccount(input: SyncBankFieldsInput): SyncBankFieldsResult {
  const shebaRaw = normalizeDigits(input.sheba);
  const accountRaw = normalizeDigits(input.account).replace(/\D/g, "");
  const bankCode = resolveShebaBankCode(input);

  let sheba = "";
  let account = "";
  let bankType = input.bankType ?? BANK_TYPES_ENUM.NONE;

  const kind = detectBankInputKind(shebaRaw || input.sheba);

  if (kind === "sheba" || (shebaRaw.length >= 22 && !accountRaw)) {
    sheba = normalizeSheba(input.sheba);
    account = shebaToAccountNumber(sheba) ?? "";
    bankType = getBankTypeBySheba(sheba) !== BANK_TYPES_ENUM.NONE ? getBankTypeBySheba(sheba) : bankType;
  } else if (accountRaw) {
    account = accountRaw;
    if (bankCode) {
      sheba = accountNumberToSheba(accountRaw, bankCode) ?? "";
      if (bankType === BANK_TYPES_ENUM.NONE) {
        const fromCode = SHEBA_CODE_MAP.get(bankCode);
        if (fromCode != null) bankType = fromCode;
      }
    }
  } else if (shebaRaw) {
    sheba = normalizeSheba(input.sheba);
    account = shebaToAccountNumber(sheba) ?? "";
  }

  const shebaValid = sheba ? validateIranSheba(sheba) : false;

  let error: string | undefined;
  if (accountRaw && !bankCode) {
    error = "برای تبدیل شماره حساب به شبا، کارت بانکی یا انتخاب بانک الزامی است";
  } else if (sheba && !shebaValid) {
    error = "شماره شبا معتبر نیست";
  }

  return {
    sheba,
    account,
    shebaCode: bankCode ?? extractShebaBankCode(sheba),
    bankType,
    bankId: getBankId(bankType),
    shebaValid,
    error,
  };
}

export function validateBankTerminalInput(input: SyncBankFieldsInput & { cardNumber?: string | null }) {
  const card = normalizeCardNumber(input.cardNumber);
  const synced = syncBankShebaAndAccount(input);
  const hasCard = card.length === 16;
  const hasValidSheba = synced.shebaValid;
  const hasAccountWithBank = !!synced.account && !!synced.shebaCode;

  if (hasCard || hasValidSheba || hasAccountWithBank) {
    return { ok: true as const, synced, card };
  }

  if (synced.account && !synced.shebaCode) {
    return {
      ok: false as const,
      message: "شماره حساب وارد شده است؛ لطفاً بانک را انتخاب کنید یا شماره کارت را وارد نمایید",
    };
  }
  if (synced.sheba && !synced.shebaValid) {
    return { ok: false as const, message: "شماره شبا معتبر نیست" };
  }
  return { ok: false as const, message: "حداقل یکی از کارت بانکی، شبای معتبر، یا شماره حساب همراه بانک را وارد کنید" };
}
