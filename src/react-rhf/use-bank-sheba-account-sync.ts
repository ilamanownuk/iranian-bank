import { useCallback } from "react";
import type { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import {
  BANK_TYPES_ENUM,
  formatShebaDisplay,
  getBankDetails,
  getIranianBankSelectOptions,
  normalizeDigits,
  normalizeSheba,
  syncBankShebaAndAccount,
  validateIranSheba,
  type BankSelectOption,
} from "../core";
import type { BankFieldPaths } from "./paths";

export function useBankShebaAccountSync<TForm extends FieldValues>(
  methods: UseFormReturn<TForm>,
  paths: BankFieldPaths<TForm>,
) {
  const { sheba: shebaPath, account: accountPath, card: cardPath, selectedBank: selectedBankPath } = paths;

  const applySync = useCallback(
    (
      source: "sheba" | "account" | "bank" | "card",
      overrides?: { sheba?: string; account?: string; bankType?: BANK_TYPES_ENUM | null },
    ) => {
      const sheba = overrides?.sheba ?? (methods.getValues(shebaPath) as string | undefined);
      const account = overrides?.account ?? (methods.getValues(accountPath) as string | undefined);
      const card = cardPath ? (methods.getValues(cardPath) as string | undefined) : undefined;
      const selected = selectedBankPath
        ? (methods.getValues(selectedBankPath) as BankSelectOption | null | undefined)
        : undefined;
      const bankType = overrides?.bankType ?? selected?.bankType ?? null;

      const synced = syncBankShebaAndAccount({ sheba, account, cardNumber: card, bankType });

      if (source !== "sheba" && synced.sheba) {
        const display = formatShebaDisplay(synced.sheba);
        const current = normalizeSheba(sheba);
        if (current !== synced.sheba) {
          methods.setValue(shebaPath, display as PathValue<TForm, typeof shebaPath>, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }

      if (source !== "account" && synced.account) {
        const current = normalizeDigits(account);
        if (current !== synced.account) {
          methods.setValue(accountPath, synced.account as PathValue<TForm, typeof accountPath>, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      }

      if (selectedBankPath && source !== "bank" && synced.bankType !== BANK_TYPES_ENUM.NONE) {
        const details = getBankDetails(synced.bankType);
        const option = getIranianBankSelectOptions().find((o) => o.bankType === synced.bankType);
        const nextValue = (option ?? {
          id: String(synced.bankType),
          bankType: synced.bankType,
          bankId: synced.bankId,
          name: details.faName,
          shebaCode: details.shebaCode,
          logoUrl: details.logoUrl,
        }) as PathValue<TForm, Path<TForm>>;

        if (selected?.bankType !== synced.bankType) {
          methods.setValue(selectedBankPath, nextValue as PathValue<TForm, typeof selectedBankPath>, {
            shouldDirty: true,
          });
        }
      }

      return synced;
    },
    [accountPath, cardPath, methods, selectedBankPath, shebaPath],
  );

  const onShebaChange = useCallback(
    (value: string) => {
      methods.setValue(shebaPath, value as PathValue<TForm, typeof shebaPath>, { shouldDirty: true });
      return applySync("sheba", { sheba: value });
    },
    [applySync, methods, shebaPath],
  );

  const onAccountChange = useCallback(
    (value: string) => {
      methods.setValue(accountPath, value as PathValue<TForm, typeof accountPath>, { shouldDirty: true });
      return applySync("account", { account: value });
    },
    [accountPath, applySync, methods],
  );

  const onBankSelect = useCallback(
    (bank: BankSelectOption | null) => {
      if (selectedBankPath) {
        methods.setValue(selectedBankPath, bank as PathValue<TForm, typeof selectedBankPath>, { shouldDirty: true });
      }
      return applySync("bank", { bankType: bank?.bankType ?? null });
    },
    [applySync, methods, selectedBankPath],
  );

  const onCardComplete = useCallback(() => applySync("card"), [applySync]);

  const shebaStatus = useCallback(
    (sheba?: string) => {
      const n = normalizeSheba(sheba);
      if (!n || n.length < 26) return null;
      return validateIranSheba(n) ? ("valid" as const) : ("invalid" as const);
    },
    [],
  );

  const formatShebaOnBlur = useCallback(() => {
    const current = methods.getValues(shebaPath) as string | undefined;
    const formatted = formatShebaDisplay(current);
    if (formatted && formatted.includes(" ")) {
      methods.setValue(shebaPath, formatted as PathValue<TForm, typeof shebaPath>);
    }
  }, [methods, shebaPath]);

  return {
    onShebaChange,
    onAccountChange,
    onBankSelect,
    onCardComplete,
    shebaStatus,
    formatShebaOnBlur,
    bankOptions: getIranianBankSelectOptions(),
    paths,
  };
}
