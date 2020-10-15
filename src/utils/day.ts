import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Week } from "../models";
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

dayjs.Ls.en.weekStart = 1;
dayjs.extend(weekOfYear);
dayjs.extend(utc);

export default dayjs;
export const today = () => dayjs.utc().format("YYYY-MM-DDTHH:mm:ssZ");
export const actualWeekNumber = () => dayjs.utc().week();

export const aDayBeforeInUnix = () => dayjs.utc().subtract(1, "day").unix()
export const nowInUnix = () => dayjs.utc().unix()

export const getCurrentWeek = async () => {
  const weeks = await Week.getAllWeeks()

  if(!weeks) {
    return false
  }

  const todayDate = dayjs.utc()

  return weeks.find(week => {
    const formattedEndDate = dayjs.utc(week.end_date)
    const formattedStartDate = dayjs.utc(week.start_date)

    return todayDate.isBetween(formattedStartDate, formattedEndDate)
  })
}

export const todayTimestamp = () => {
  return dayjs.utc().format('YYYY-MM-DDTHH:mm:ssZ')
}

export const getCurrentPeriodId = async () => {
  const currentWeek = await getCurrentWeek()

  if(currentWeek) {
    return currentWeek.fk_period_id
  }

  return '-1'
}