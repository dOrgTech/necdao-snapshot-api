import { RewardMultipleType } from "../models/RewardMultiple";
import { nowInUnix, aDayBeforeInUnix } from "../utils/day";

export const getLast24HoursVolume = async () => {
  try {
    const url =
      process.env.DIVERSIFI_URL +
      `/trading/r/USDRanking?startDate=${aDayBeforeInUnix() * 1000}&endDate=${nowInUnix() * 1000}`;
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error("Error getting volume data ", e);
    return undefined;
  }
};

export const getCorrectMultipleFromTradingVolume = (
  userTradingVolume: number,
  multiples?: RewardMultipleType[]
) => {
  if (!multiples) {
    return null
  }

  const correspondingMultiple = multiples
    .sort((a, b) => a.upper_limit - b.upper_limit)
    .find((m) => m.upper_limit > userTradingVolume);

  return correspondingMultiple || multiples.slice(-1)[0]
};

export const getVolumeFromUser = async (address: string) => {
  const volumns = await getLast24HoursVolume()

  const userHasTrade = volumns.find((volume: any) => volume.address === address)
  const userTradingVolume = userHasTrade ? userHasTrade.USDValue : 0

  return userTradingVolume
}