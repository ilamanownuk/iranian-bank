import { resolveLogoUrl } from "./logos";
import { normalizeCardNumber } from "./normalize";
import { extractShebaBankCode } from "./sheba";
import { BANK_TYPES_ENUM, type BankId, type BankLogoPayload, type BankTypeDetails } from "./types";

const theme = (light: string, dark: string) => ({ light, dark });

function bank(
  id: BANK_TYPES_ENUM,
  bankId: BankId,
  faName: string,
  shebaCode: string,
  cardPrefixes: readonly string[],
): BankTypeDetails {
  return {
    id,
    bankId,
    faName,
    shebaCode,
    cardPrefixes,
    logoUrl: resolveLogoUrl(bankId),
  };
}

export const IRANIAN_BANKS: readonly BankTypeDetails[] = [
  bank(BANK_TYPES_ENUM.MELLI, "melli", "ملی", "017", ["603799", "589905"]),
  bank(BANK_TYPES_ENUM.TEJARAT, "tejarat", "تجارت", "018", ["627353", "585983"]),
  bank(BANK_TYPES_ENUM.MELLAT, "mellat", "ملت", "012", ["610433", "991975"]),
  bank(BANK_TYPES_ENUM.SADERAT, "saderat", "صادرات", "019", ["603769", "903769"]),
  bank(BANK_TYPES_ENUM.KESHAVARZI, "keshavarzi", "کشاورزی", "016", ["603770", "639217"]),
  bank(BANK_TYPES_ENUM.MASKAN, "maskan", "مسکن", "014", ["628023"]),
  bank(BANK_TYPES_ENUM.REFAH, "refah", "رفاه", "013", ["589463"]),
  bank(BANK_TYPES_ENUM.SEPAH, "sepah", "سپه", "015", ["589210", "604932"]),
  bank(BANK_TYPES_ENUM.MEHR, "mehr", "مهر ایران", "060", ["606373"]),
  bank(BANK_TYPES_ENUM.POST_BANK, "post_bank", "پست بانک", "021", ["627760"]),
  bank(BANK_TYPES_ENUM.TOSE_SADERAT, "tose_saderat", "توسعه صادرات", "020", ["627648", "207177"]),
  bank(BANK_TYPES_ENUM.PASARGARD, "pasargad", "پاسارگاد", "057", ["502229", "639347"]),
  bank(BANK_TYPES_ENUM.PARSAIN, "parsian", "پارسیان", "054", ["622106", "627884"]),
  bank(BANK_TYPES_ENUM.EGHTESAD_NOVIN, "eghtesad_novin", "اقتصاد نوین", "055", ["627412"]),
  bank(BANK_TYPES_ENUM.AYANDE, "ayande", "آینده", "062", ["636214", "186214"]),
  bank(BANK_TYPES_ENUM.SINA, "sina", "سینا", "059", ["639346"]),
  bank(BANK_TYPES_ENUM.TOSE_TAVON, "tose_tavon", "توسعه تعاون", "022", ["502908"]),
  bank(BANK_TYPES_ENUM.BLU, "blu", "بلو بانک", "", ["62198619"]),
  bank(BANK_TYPES_ENUM.SAMAN, "saman", "سامان", "056", ["621986"]),
  bank(BANK_TYPES_ENUM.KARAFARIN, "karafarin", "کارآفرین", "053", ["627488", "502910"]),
  bank(BANK_TYPES_ENUM.SHAHR, "shahr", "شهر", "061", ["504706", "502806"]),
  bank(BANK_TYPES_ENUM.DAY, "day", "دی", "066", ["502938"]),
  bank(BANK_TYPES_ENUM.SARMAIEH, "sarmayeh", "سرمایه", "058", ["639607"]),
  bank(BANK_TYPES_ENUM.GARDESHGARI, "gardeshgari", "گردشگری", "064", ["505416"]),
  bank(BANK_TYPES_ENUM.IRAN_ZAMIN, "iran_zamin", "ایران زمین", "069", ["505785"]),
  bank(BANK_TYPES_ENUM.RESALAT, "resalat", "رسالت", "070", ["504172"]),
  bank(BANK_TYPES_ENUM.KHAVARMIANEH, "khavarmianeh", "خاورمیانه", "078", ["505809", "585947"]),
  bank(BANK_TYPES_ENUM.HEKMAT_IRANIAN, "hekmat_iranian", "حکمت ایرانیان", "065", ["636949"]),
  bank(BANK_TYPES_ENUM.SANAT_O_MADAN, "sanat_o_madan", "صنعت و معدن", "011", ["627961"]),
  bank(BANK_TYPES_ENUM.MELAL, "melal", "ملل", "075", ["606256"]),
  bank(BANK_TYPES_ENUM.NONE, "none", "نامشخص", "", []),
];

export const bank_types_details: Record<BANK_TYPES_ENUM, BankTypeDetails> = IRANIAN_BANKS.reduce(
  (acc, b) => {
    acc[b.id] = b;
    return acc;
  },
  {} as Record<BANK_TYPES_ENUM, BankTypeDetails>,
);

export const BANK_ID_BY_ENUM: Record<BANK_TYPES_ENUM, BankId> = IRANIAN_BANKS.reduce(
  (acc, b) => {
    acc[b.id] = b.bankId;
    return acc;
  },
  {} as Record<BANK_TYPES_ENUM, BankId>,
);

const CARD_PREFIX_MAP: Array<{ prefix: string; type: BANK_TYPES_ENUM }> = IRANIAN_BANKS.flatMap((b) =>
  b.cardPrefixes.map((prefix) => ({ prefix, type: b.id })),
).sort((a, b) => b.prefix.length - a.prefix.length);

const SHEBA_CODE_MAP = new Map(IRANIAN_BANKS.filter((b) => b.shebaCode).map((b) => [b.shebaCode, b.id]));

const bankLogo = (label: string, logoUrl: string | undefined, light: string, dark: string): BankLogoPayload => ({
  logoUrl,
  label,
  code: light,
  theme: theme(light, dark),
});

const CARD_THEMES: Partial<Record<BANK_TYPES_ENUM, BankLogoPayload>> = {
  [BANK_TYPES_ENUM.MELLI]: bankLogo("ملی", resolveLogoUrl("melli"), "#E8D9A0", "#4A3F1F"),
  [BANK_TYPES_ENUM.TEJARAT]: bankLogo("تجارت", resolveLogoUrl("tejarat"), "#D6E4FF", "#1E3A5F"),
  [BANK_TYPES_ENUM.MELLAT]: bankLogo("ملت", resolveLogoUrl("mellat"), "#FFD6E5", "#6B1E3C"),
  [BANK_TYPES_ENUM.SADERAT]: bankLogo("صادرات", resolveLogoUrl("saderat"), "#D1D5DB", "#2C3E50"),
  [BANK_TYPES_ENUM.KESHAVARZI]: bankLogo("کشاورزی", resolveLogoUrl("keshavarzi"), "#D4EDDA", "#1B4332"),
  [BANK_TYPES_ENUM.MASKAN]: bankLogo("مسکن", resolveLogoUrl("maskan"), "#FFD9A8", "#7C4A12"),
  [BANK_TYPES_ENUM.REFAH]: bankLogo("رفاه", resolveLogoUrl("refah"), "#E5E7EB", "#374151"),
  [BANK_TYPES_ENUM.SEPAH]: bankLogo("سپه", resolveLogoUrl("sepah"), "#F0D78C", "#5C4A1F"),
  [BANK_TYPES_ENUM.MEHR]: bankLogo("مهر ایران", resolveLogoUrl("mehr"), "#E8F0C8", "#3D4F21"),
  [BANK_TYPES_ENUM.POST_BANK]: bankLogo("پست بانک", undefined, "#FFF3BF", "#6B5A00"),
  [BANK_TYPES_ENUM.TOSE_SADERAT]: bankLogo("توسعه صادرات", undefined, "#C7D8F0", "#1A3050"),
  [BANK_TYPES_ENUM.PASARGARD]: bankLogo("پاسارگاد", resolveLogoUrl("pasargad"), "#C8F0D4", "#0F5C32"),
  [BANK_TYPES_ENUM.PARSAIN]: bankLogo("پارسیان", resolveLogoUrl("parsian"), "#FFE4C7", "#8B3A00"),
  [BANK_TYPES_ENUM.EGHTESAD_NOVIN]: bankLogo("اقتصاد نوین", undefined, "#C5DCF5", "#0C3B6E"),
  [BANK_TYPES_ENUM.AYANDE]: bankLogo("آینده", resolveLogoUrl("ayande"), "#F5D6FF", "#4A1F6E"),
  [BANK_TYPES_ENUM.SINA]: bankLogo("سینا", resolveLogoUrl("sina"), "#C8E6F5", "#0D4A73"),
  [BANK_TYPES_ENUM.TOSE_TAVON]: bankLogo("توسعه تعاون", resolveLogoUrl("tose_tavon"), "#D6EEFB", "#1A4A66"),
  [BANK_TYPES_ENUM.BLU]: bankLogo("بلو بانک", resolveLogoUrl("blu"), "#B8D4F5", "#1A3557"),
  [BANK_TYPES_ENUM.SAMAN]: bankLogo("سامان", resolveLogoUrl("saman"), "#B8E8FA", "#0A5F8A"),
  [BANK_TYPES_ENUM.KARAFARIN]: bankLogo("کارآفرین", resolveLogoUrl("karafarin"), "#C8F0D8", "#145A32"),
  [BANK_TYPES_ENUM.SHAHR]: bankLogo("شهر", resolveLogoUrl("shahr"), "#FFD0D0", "#8B1A1A"),
  [BANK_TYPES_ENUM.DAY]: bankLogo("دی", resolveLogoUrl("day"), "#C8F5D8", "#0F6B3A"),
  [BANK_TYPES_ENUM.SARMAIEH]: bankLogo("سرمایه", resolveLogoUrl("sarmayeh"), "#FFD6D6", "#7A1528"),
  [BANK_TYPES_ENUM.GARDESHGARI]: bankLogo("گردشگری", resolveLogoUrl("gardeshgari"), "#B8F0EC", "#0A5C56"),
  [BANK_TYPES_ENUM.IRAN_ZAMIN]: bankLogo("ایران زمین", undefined, "#E8DCC8", "#5C4030"),
  [BANK_TYPES_ENUM.RESALAT]: bankLogo("رسالت", resolveLogoUrl("resalat"), "#C8F0D4", "#0B5C30"),
  [BANK_TYPES_ENUM.KHAVARMIANEH]: bankLogo("خاورمیانه", undefined, "#FFE0C2", "#8B4513"),
  [BANK_TYPES_ENUM.HEKMAT_IRANIAN]: bankLogo("حکمت ایرانیان", undefined, "#C8D8F5", "#1A3070"),
  [BANK_TYPES_ENUM.SANAT_O_MADAN]: bankLogo("صنعت و معدن", undefined, "#E2E8F0", "#334155"),
  [BANK_TYPES_ENUM.MELAL]: bankLogo("ملل", undefined, "#C8DAF5", "#1A3D7A"),
};

const UNKNOWN_CARD_LOGO: BankLogoPayload = {
  label: "بانک نامشخص",
  code: "#F2F2F2",
  theme: theme("#F2F2F2", "#2f2f2f"),
};

export function getBankTypeByCard(card: unknown): BANK_TYPES_ENUM {
  const normalized = normalizeCardNumber(card);
  if (!normalized || normalized.length < 6) return BANK_TYPES_ENUM.NONE;
  for (const { prefix, type } of CARD_PREFIX_MAP) {
    if (normalized.startsWith(prefix)) return type;
  }
  return BANK_TYPES_ENUM.NONE;
}

export function getBankTypeBySheba(sheba: unknown): BANK_TYPES_ENUM {
  const code = extractShebaBankCode(sheba);
  if (!code) return BANK_TYPES_ENUM.NONE;
  return SHEBA_CODE_MAP.get(code) ?? BANK_TYPES_ENUM.NONE;
}

export function getBankDetails(type: BANK_TYPES_ENUM): BankTypeDetails {
  return bank_types_details[type] ?? bank_types_details[BANK_TYPES_ENUM.NONE];
}

export function getBankId(type: BANK_TYPES_ENUM): BankId {
  return BANK_ID_BY_ENUM[type] ?? "none";
}

export function getShebaCodeByBankType(type: BANK_TYPES_ENUM): string | null {
  const code = getBankDetails(type).shebaCode;
  return code || null;
}

export function getBankLogoPayload(type: BANK_TYPES_ENUM): BankLogoPayload {
  const themed = CARD_THEMES[type];
  if (themed) return themed;
  const details = getBankDetails(type);
  if (type === BANK_TYPES_ENUM.NONE) return UNKNOWN_CARD_LOGO;
  return {
    logoUrl: details.logoUrl,
    label: details.faName,
    code: "#e8edf2",
    theme: theme("#e8edf2", "#2a3440"),
  };
}

export function getBankLogoByCard(card: string): BankLogoPayload {
  return getBankLogoPayload(getBankTypeByCard(card));
}

export function getBankLogoBySheba(sheba: string): BankLogoPayload {
  return getBankLogoPayload(getBankTypeBySheba(sheba));
}

export function getBankThemeCode(logo: BankLogoPayload, mode: "light" | "dark" = "light"): string {
  return mode === "dark" ? logo.theme.dark : logo.theme.light;
}

export function getIranianBankSelectOptions() {
  return IRANIAN_BANKS.filter((b) => b.id !== BANK_TYPES_ENUM.NONE).map((b) => ({
    id: String(b.id),
    bankType: b.id,
    bankId: b.bankId,
    name: b.faName,
    shebaCode: b.shebaCode,
    logoUrl: b.logoUrl,
    image: b.image,
  }));
}

export { CARD_PREFIX_MAP, SHEBA_CODE_MAP };
