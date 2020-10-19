import { RewardMultipleType } from "../models/RewardMultiple";
import { nowInUnix, aDayBeforeInUnix } from "../utils/day";

export const getLast24HoursVolume = async () => {
  try {
    const url =
      process.env.DIVERSIFI_URL +
      `/trading/r/USDRanking?startDate=${aDayBeforeInUnix() * 1000}&endDate=${nowInUnix() * 1000}`;
    console.log(url)
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
    .sort((a, b) => b.lower_limit - a.lower_limit)
    .find((m) => m.lower_limit <= userTradingVolume);

  return correspondingMultiple || multiples.slice(-1)[0]
};

export const getVolumeFromUser = async (address: string) => {
  const volumns = await getLast24HoursVolume()
  console.log(volumns)
  const userHasTrade = volumns.find((volume: any) => volume.address === address.toLowerCase())
  const userTradingVolume = userHasTrade ? userHasTrade.USDVolume : 0
  console.log(userTradingVolume)
  return userTradingVolume
}