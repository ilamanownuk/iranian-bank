/** Public CDN for Iranian bank logos — https://github.com/ir-banks/logos */
const LOGO_BASE = "https://ir-banks.github.io/logos/banks";

export function bankLogoUrl(filename: string): string {
  return `${LOGO_BASE}/${filename}`;
}

export const BANK_LOGO_FILES: Record<string, string> = {
  melli: "Melli.svg",
  tejarat: "Tejarat.svg",
  mellat: "Mellat.svg",
  saderat: "Saderat.svg",
  keshavarzi: "Keshavarzi.svg",
  maskan: "Maskan.svg",
  refah: "Refah.svg",
  sepah: "Sepah.svg",
  mehr: "Mehr.svg",
  pasargad: "Pasargad.svg",
  parsian: "Parsian.svg",
  ayande: "Ayandeh.svg",
  sina: "Sina.svg",
  tose_tavon: "Tosee-Taavon.svg",
  blu: "BluBank.svg",
  saman: "Saman.svg",
  karafarin: "Karafarin.svg",
  shahr: "Shahr.svg",
  day: "Dey.svg",
  sarmayeh: "Sarmayeh.svg",
  gardeshgari: "Gardeshgari.svg",
  resalat: "Resalat.svg",
};

export function resolveLogoUrl(bankId: string): string | undefined {
  const file = BANK_LOGO_FILES[bankId];
  return file ? bankLogoUrl(file) : undefined;
}
