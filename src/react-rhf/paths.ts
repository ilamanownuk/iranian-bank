import type { FieldValues, Path } from "react-hook-form";
import type { BankSelectOption } from "../core";

export type BankFieldPaths<TForm extends FieldValues> = {
  sheba: Path<TForm>;
  account: Path<TForm>;
  card?: Path<TForm>;
  selectedBank?: Path<TForm>;
};

/** Default paths for nested extra.* bank fields (common in Persian accounting apps) */
export const DEFAULT_BANK_FIELD_PATHS = {
  sheba: "extra.bankShebaNumber",
  account: "extra.bankAccountNumber",
  card: "extra.bankCardNumber",
  selectedBank: "selectedBank",
} as const;

export type DefaultBankFormFields = {
  extra?: {
    bankShebaNumber?: string | null;
    bankAccountNumber?: string | null;
    bankCardNumber?: string | null;
  };
  selectedBank?: BankSelectOption | null;
};

export type { BankSelectOption };
