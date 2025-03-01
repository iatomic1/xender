import {
  PrincipalCV,
  standardPrincipalCV,
  contractPrincipalCV,
} from "@stacks/transactions";

export type Row = {
  to: string;
  stx: string;
  memo?: string;
  error?: string;
  toCV?: PrincipalCV;
};

export const addrToCV = (addr: string) => {
  const toParts = addr.split(".");
  if (toParts.length === 1) {
    return standardPrincipalCV(toParts[0]);
  } else {
    return contractPrincipalCV(toParts[0], toParts[1]);
  }
};

export const addToCVValues = async <T extends Row>(parts: T[]) => {
  return Promise.all(
    parts.map(async (p) => {
      if (p.to === "") {
        return p;
      }
      try {
        return { ...p, toCV: addrToCV(p.to) };
      } catch (e) {
        return { ...p, error: `${p.to} not found` };
      }
    }),
  );
};

export function nonEmptyPart(p: Row) {
  return !!p.toCV && p.stx !== "0" && p.stx !== "";
}
export const getPartsFromRows = (currentRows: Row[]) => {
  const parts = currentRows.map((r) => ({
    ...r,
    ustx: Math.floor(parseFloat(r.stx) * Math.pow(10, 6)), // STX has 6 decimals
  }));

  const total = parts
    .filter((part) => !isNaN(part.ustx))
    .reduce((sum, r) => sum + r.ustx, 0);

  return { parts, total };
};
