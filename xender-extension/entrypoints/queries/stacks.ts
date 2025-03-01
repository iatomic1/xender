import axios from "axios";

export interface StacksData {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
  explorer: string;
}

export interface StacksApiResponse {
  data: StacksData;
  timestamp: number;
}

export const getStacksData = async (): Promise<StacksApiResponse | null> => {
  try {
    const url = "https://api.coincap.io/v2/assets/stacks";

    const { data } = await axios.get<StacksApiResponse>(url);
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};
