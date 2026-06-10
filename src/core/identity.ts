import {
  getBankDetails,
  getBankId,
  getBankLogoPayload,
  getBankTypeByCard,
  getBankTypeBySheba,
  getShebaCodeByBankType,
  SHEBA_CODE_MAP,
} from "./registry";
import { normalizeCardNumber } from "./normalize";
import { extractShebaBankCode } from "./sheba";
import { BANK_TYPES_ENUM, type BankIdentityInput, type BankIdentityResult, type SyncBankFieldsInput } from "./types";

export function resolveShebaBankCode(input: SyncBankFieldsInput): string | null {
  if (input.bankType != null && input.bankType !== BANK_TYPES_ENUM.NONE) {
    return getShebaCodeByBankType(input.bankType);
  }
  const fromSheba = extractShebaBankCode(input.sheba);
  if (fromSheba) return fromSheba;
  const fromCard = getBankTypeByCard(input.cardNumber);
  if (fromCard !== BANK_TYPES_ENUM.NONE) return getShebaCodeByBankType(fromCard);
  return null;
}

export function resolveBankIdentity(input: BankIdentityInput): BankIdentityResult {
  const byCard = getBankTypeByCard(input.cardNumber);
  const bySheba = getBankTypeBySheba(input.shebaNumber);
  const byType = input.bankType != null && input.bankType !== BANK_TYPES_ENUM.NONE ? input.bankType : BANK_TYPES_ENUM.NONE;

  const resolvedType = byCard !== BANK_TYPES_ENUM.NONE ? byCard : bySheba !== BANK_TYPES_ENUM.NONE ? bySheba : byType;
  const details = getBankDetails(resolvedType);
  const logo = getBankLogoPayload(resolvedType);

  return {
    type: resolvedType,
    bankId: getBankId(resolvedType),
    details,
    logo,
    shebaCode: details.shebaCode || extractShebaBankCode(input.shebaNumber),
  };
}

export function getBankByCard(card: string): string {
  const type = getBankTypeByCard(card);
  if (type === BANK_TYPES_ENUM.NONE) {
    const fourth = normalizeCardNumber(card).substring(12);
    return fourth ? `بانک ن.م (${fourth})` : "بانک";
  }
  const fourth = normalizeCardNumber(card).substring(12);
  return fourth ? `${getBankDetails(type).faName} (${fourth})` : getBankDetails(type).faName;
}

export function getBankBySheba(sheba: string): BANK_TYPES_ENUM {
  return getBankTypeBySheba(sheba);
}

export { SHEBA_CODE_MAP };
