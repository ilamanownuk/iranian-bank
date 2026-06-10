import type { ReactNode } from "react";
import type { BankIdentityResult, BankLogoPayload, BankTypeDetails } from "../core";

export type BankLogoRenderProps = {
  src: string;
  alt: string;
  size: number;
  className?: string;
};

export type BankLogoProps = {
  /** Full identity from `resolveBankIdentity` */
  bank?: BankIdentityResult;
  /** Or pass logo payload / bank details directly */
  logo?: BankLogoPayload;
  details?: BankTypeDetails;
  alt?: string;
  size?: number;
  className?: string;
  /** Custom image renderer — use Next.js `<Image />` or any img wrapper */
  renderImage?: (props: BankLogoRenderProps) => ReactNode;
};

function resolveLogoSrc(props: BankLogoProps): string | undefined {
  return props.logo?.logoUrl ?? props.bank?.logo.logoUrl ?? props.details?.logoUrl ?? props.bank?.details.logoUrl;
}

function resolveAlt(props: BankLogoProps): string {
  return props.alt ?? props.logo?.label ?? props.bank?.logo.label ?? props.details?.faName ?? "لوگوی بانک";
}

export function BankLogo({ size = 48, className = "", renderImage, ...props }: BankLogoProps) {
  const src = resolveLogoSrc(props);
  const alt = resolveAlt(props);

  if (!src) return null;

  if (renderImage) {
    return <>{renderImage({ src, alt, size, className })}</>;
  }

  return <img src={src} alt={alt} width={size} height={size} className={className} loading="lazy" />;
}

/** @deprecated Use `BankLogo` */
export const BankLogoImage = BankLogo;
