/** Numeric bank enum — kept for backward compatibility with existing consumers */
export enum BANK_TYPES_ENUM {
  MELLI,
  TEJARAT,
  MELLAT,
  SADERAT,
  KESHAVARZI,
  MASKAN,
  REFAH,
  SEPAH,
  MEHR,
  POST_BANK,
  TOSE_SADERAT,
  PASARGARD,
  PARSAIN,
  EGHTESAD_NOVIN,
  AYANDE,
  SINA,
  TOSE_TAVON,
  BLU,
  SAMAN,
  KARAFARIN,
  SHAHR,
  DAY,
  SARMAIEH,
  GARDESHGARI,
  IRAN_ZAMIN,
  RESALAT,
  KHAVARMIANEH,
  HEKMAT_IRANIAN,
  SANAT_O_MADAN,
  MELAL,
  NONE,
}

/** String-based bank identifier — preferred for public API stability */
export type BankId =
  | "melli"
  | "tejarat"
  | "mellat"
  | "saderat"
  | "keshavarzi"
  | "maskan"
  | "refah"
  | "sepah"
  | "mehr"
  | "post_bank"
  | "tose_saderat"
  | "pasargad"
  | "parsian"
  | "eghtesad_novin"
  | "ayande"
  | "sina"
  | "tose_tavon"
  | "blu"
  | "saman"
  | "karafarin"
  | "shahr"
  | "day"
  | "sarmayeh"
  | "gardeshgari"
  | "iran_zamin"
  | "resalat"
  | "khavarmianeh"
  | "hekmat_iranian"
  | "sanat_o_madan"
  | "melal"
  | "none";

export type BankImageSource =
  | string
  | { src: string; width?: number; height?: number }
  | undefined;

export type BankLogoPayload = {
  logoUrl?: string;
  image?: BankImageSource;
  label: string;
  code: string;
  theme: { light: string; dark: string };
};

export type BankTypeDetails = {
  id: BANK_TYPES_ENUM;
  bankId: BankId;
  faName: string;
  shebaCode: string;
  cardPrefixes: readonly string[];
  logoUrl?: string;
  image?: BankImageSource;
};

export type BankIdentityInput = {
  cardNumber?: unknown;
  shebaNumber?: unknown;
  bankType?: BANK_TYPES_ENUM | null;
};

export type BankIdentityResult = {
  type: BANK_TYPES_ENUM;
  bankId: BankId;
  details: BankTypeDetails;
  logo: BankLogoPayload;
  shebaCode: string | null;
};

export type BankInputKind = "sheba" | "account" | "unknown";

export type SyncBankFieldsInput = {
  sheba?: string | null;
  account?: string | null;
  cardNumber?: string | null;
  bankType?: BANK_TYPES_ENUM | null;
};

export type SyncBankFieldsResult = {
  sheba: string;
  account: string;
  shebaCode: string | null;
  bankType: BANK_TYPES_ENUM;
  bankId: BankId;
  shebaValid: boolean;
  error?: string;
};

export type BankSelectOption = {
  id: string;
  bankType: BANK_TYPES_ENUM;
  bankId: BankId;
  name: string;
  shebaCode: string;
  logoUrl?: string;
  image?: BankImageSource;
};
