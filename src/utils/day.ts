import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.Ls.en.weekStart = 1;
dayjs.extend(weekOfYear);
dayjs.extend(utc);

export default dayjs;
export const today = dayjs().utc().format("YYYY-MM-DD");
export const actualWeekNumber = dayjs().week();
