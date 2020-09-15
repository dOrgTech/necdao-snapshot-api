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
export const today = () => dayjs().utc().format("YYYY-MM-DD");
export const actualWeekNumber = () => dayjs().week();

export const getCurrentWeek = async () => {
  const weeks = await Week.getAllWeeks()

  if(!weeks) {
    return false
  }

  const todayDate = dayjs()

  return weeks.find(week => {
    const formattedEndDate = dayjs(week.end_date)
    const formattedStartDate = dayjs(week.start_date)

    return todayDate.isBetween(formattedStartDate, formattedEndDate)
  })
}

export const todayTimestamp = () => {
  return dayjs().format('YYYY-MM-DD HH:mm:ssZ')
}

export const getCurrentPeriodId = async () => {
  const currentWeek = await getCurrentWeek()

  if(currentWeek) {
    return currentWeek.fk_period_id
  }

  return '-1'
}