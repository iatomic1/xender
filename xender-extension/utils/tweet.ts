export const cleanDisplayName = (text: string): string => {
  const allowedCharactersRegex = /[^a-zA-Z\-_.]/g;
  return text.replace(allowedCharactersRegex, "");
};

export const hasValidSuffix = (text: string): boolean => {
  const validSuffixes = [".btc", ".stx", ".id"];
  return validSuffixes.some((suffix) => text.endsWith(suffix));
};

export const getUsernameFromUrl = (url: string): string => {
  return url.replace(/^https?:\/\/(www\.)?x\.com\//, "");
};
