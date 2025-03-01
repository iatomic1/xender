export const cleanDisplayName = (text: string): string => {
  const allowedCharactersRegex = /[^a-zA-Z\-_.]/g;
  return text.replace(allowedCharactersRegex, "");
};

export const hasValidSuffix = (text: string): boolean => {
  const validSuffixes = [".btc", ".stx", ".id"];
  return validSuffixes.some((suffix) => text.endsWith(suffix));
};

export const truncateStr = (
  str: string,
  startChars: number = 5,
  endChars: number = 1,
): string => {
  if (str.length <= startChars + endChars) return str;
  return str.slice(0, startChars) + "..." + str.slice(-endChars);
};
