import { useMemo } from "react";
type TokenBalance = {
  balance: string;
  rawBalance: number;
  formattedBalance: string;
};

type BalanceRecord = {
  [key: string]: TokenBalance;
};

type TokenAvailability = {
  [key: string]: boolean;
};

export function useTokenBalance(
  balance: any,
  SUPPORTED_TOKENS: Record<string, string>,
) {
  // Track available tokens
  const availableTokens = useMemo<TokenAvailability>(() => {
    const tokens: TokenAvailability = {
      STX: !!balance?.stx,
      sBTC: true,
    };

    if (balance?.fungible_tokens) {
      const memeKey = `${SUPPORTED_TOKENS.MEME}::MEME`;
      tokens.MEME =
        !!balance.fungible_tokens[memeKey]?.balance &&
        parseInt(balance.fungible_tokens[memeKey].balance, 10) > 0;

      const velarKey = `${SUPPORTED_TOKENS.VELAR}::velar`;
      tokens.VELAR =
        !!balance.fungible_tokens[velarKey]?.balance &&
        parseInt(balance.fungible_tokens[velarKey].balance, 10) > 0;
    }

    return tokens;
  }, [balance, SUPPORTED_TOKENS]);

  const tokenBalances = useMemo<BalanceRecord>(() => {
    const balances: BalanceRecord = {};

    balances.STX = {
      balance: balance?.stx?.balance || "0",
      rawBalance: balance?.stx
        ? parseInt(balance.stx.balance, 10) / 1000000
        : 0,
      formattedBalance: formatBalance(balance?.stx?.balance || "0", "STX"),
    };

    balances.sBTC = {
      balance: "0",
      rawBalance: 0,
      formattedBalance: "0",
    };

    if (balance?.fungible_tokens) {
      const memeKey = `${SUPPORTED_TOKENS.MEME}::MEME`;
      const memeBalance = balance.fungible_tokens[memeKey]?.balance || "0";
      balances.MEME = {
        balance: memeBalance,
        rawBalance: parseInt(memeBalance, 10) / 1000000,
        formattedBalance: formatBalance(memeBalance, "MEME"),
      };

      const velarKey = `${SUPPORTED_TOKENS.VELAR}::velar`;
      const velarBalance = balance.fungible_tokens[velarKey]?.balance || "0";
      balances.VELAR = {
        balance: velarBalance,
        rawBalance: parseInt(velarBalance, 10) / 1000000,
        formattedBalance: formatBalance(velarBalance, "VELAR"),
      };
    } else {
      balances.MEME = { balance: "0", rawBalance: 0, formattedBalance: "0" };
      balances.VELAR = { balance: "0", rawBalance: 0, formattedBalance: "0" };
    }

    return balances;
  }, [balance, SUPPORTED_TOKENS]);

  const validateAmount = (amount: string, currency: string): boolean => {
    const numAmount = Number.parseFloat(amount || "0");
    if (isNaN(numAmount) || numAmount <= 0) return false;

    const tokenBalance = tokenBalances[currency]?.rawBalance || 0;
    return numAmount <= tokenBalance;
  };

  return {
    availableTokens,
    tokenBalances,
    validateAmount,
  };
}

function formatBalance(balance: string, currency: string): string {
  const num = parseInt(balance, 10);
  if (isNaN(num)) return "0";

  const divisor = 1_000_000;
  return (num / divisor).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}
