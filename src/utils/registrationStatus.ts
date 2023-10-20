import type { GetExpiryReturnType } from "@ensdomains/ensjs/public";

export type RegistrationStatus = "registered" | "available";

export const getRegistrationStatus = ({
  name,
  expiryData,
  supportedTld,
}: {
  name: string;
  expiryData?: GetExpiryReturnType;
  supportedTld?: boolean | null;
}): RegistrationStatus | null => {
  const labels = name.split(".");
  const isETH = labels[labels.length - 1] === "eth";
  const is2LD = labels.length === 2;
  const isShort = labels[0].length < 3;

  if (isETH && is2LD && isShort) {
    return null;
  }

  if (!isETH && !supportedTld) {
    return null;
  }

  if (isETH && is2LD) {
    if (!expiryData) return "available";
    if (expiryData.status === "expired") return "available";
  }

  return "registered";
};
