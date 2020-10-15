import { nowInUnix, aDayBeforeInUnix } from "../utils/day";

export const getLast24HoursVolume = async () => {
  try {
    const url = process.env.DIVERSIFI_URL + `/trading/r/USDRanking?startDate=${aDayBeforeInUnix}&endDate=${nowInUnix}`;
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Error getting volume data ", e);
    return undefined;
  }
};
