import { useCallback, useMemo, useState } from "react";
import {
  BANK_TYPES_ENUM,
  formatShebaDisplay,
  getBankDetails,
  getBankId,
  normalizeSheba,
  syncBankShebaAndAccount,
  validateIranSheba,
  type SyncBankFieldsResult,
} from "../core";

export type BankSyncState = {
  sheba: string;
  account: string;
  cardNumber: string;
  bankType: BANK_TYPES_ENUM;
};

export type UseBankSyncOptions = Partial<BankSyncState>;

export function useBankSync(initial?: UseBankSyncOptions) {
  const [state, setState] = useState<BankSyncState>({
    sheba: initial?.sheba ?? "",
    account: initial?.account ?? "",
    cardNumber: initial?.cardNumber ?? "",
    bankType: initial?.bankType ?? BANK_TYPES_ENUM.NONE,
  });

  const synced = useMemo(
    () =>
      syncBankShebaAndAccount({
        sheba: state.sheba,
        account: state.account,
        cardNumber: state.cardNumber,
        bankType: state.bankType,
      }),
    [state],
  );

  const applySynced = useCallback((source: "sheba" | "account" | "bank" | "card", result: SyncBankFieldsResult) => {
    setState((prev) => ({
      sheba: source === "sheba" ? prev.sheba : result.sheba || prev.sheba,
      account: source === "account" ? prev.account : result.account || prev.account,
      cardNumber: prev.cardNumber,
      bankType: source === "bank" ? prev.bankType : result.bankType !== BANK_TYPES_ENUM.NONE ? result.bankType : prev.bankType,
    }));
    return result;
  }, []);

  const setSheba = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, sheba: value }));
      const result = syncBankShebaAndAccount({
        sheba: value,
        account: state.account,
        cardNumber: state.cardNumber,
        bankType: state.bankType,
      });
      return applySynced("sheba", result);
    },
    [applySynced, state.account, state.bankType, state.cardNumber],
  );

  const setAccount = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, account: value }));
      const result = syncBankShebaAndAccount({
        sheba: state.sheba,
        account: value,
        cardNumber: state.cardNumber,
        bankType: state.bankType,
      });
      return applySynced("account", result);
    },
    [applySynced, state.bankType, state.cardNumber, state.sheba],
  );

  const setCardNumber = useCallback(
    (value: string) => {
      setState((prev) => ({ ...prev, cardNumber: value }));
      const result = syncBankShebaAndAccount({
        sheba: state.sheba,
        account: state.account,
        cardNumber: value,
        bankType: state.bankType,
      });
      return applySynced("card", result);
    },
    [applySynced, state.account, state.bankType, state.sheba],
  );

  const setBankType = useCallback(
    (bankType: BANK_TYPES_ENUM | null) => {
      const nextType = bankType ?? BANK_TYPES_ENUM.NONE;
      setState((prev) => ({ ...prev, bankType: nextType }));
      const result = syncBankShebaAndAccount({
        sheba: state.sheba,
        account: state.account,
        cardNumber: state.cardNumber,
        bankType: nextType,
      });
      return applySynced("bank", result);
    },
    [applySynced, state.account, state.cardNumber, state.sheba],
  );

  const shebaStatus = useCallback((sheba?: string) => {
    const n = normalizeSheba(sheba ?? state.sheba);
    if (!n || n.length < 26) return null;
    return validateIranSheba(n) ? ("valid" as const) : ("invalid" as const);
  }, [state.sheba]);

  const formattedSheba = useMemo(() => formatShebaDisplay(state.sheba), [state.sheba]);
  const bankDetails = useMemo(
    () => (state.bankType !== BANK_TYPES_ENUM.NONE ? getBankDetails(state.bankType) : null),
    [state.bankType],
  );
  const bankId = useMemo(() => getBankId(state.bankType), [state.bankType]);

  return {
    state,
    synced,
    formattedSheba,
    bankDetails,
    bankId,
    setSheba,
    setAccount,
    setCardNumber,
    setBankType,
    shebaStatus,
  };
}
