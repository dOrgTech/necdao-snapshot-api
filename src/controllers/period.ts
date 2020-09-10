import { Router, Request, Response } from "express";

import dayjs, { actualWeekNumber } from "../utils/day";
import { Period } from "../models";
import { Week } from "../models";

const router = Router();

export const schedulePeriod = async (request: Request, response: Response) => {
  const { necPerWeek, start_date } = request.body;

  try {
    let parsedStartDate = dayjs(start_date);

    const totalNec = (necPerWeek as number[]).reduce((prev, current) => {
      return prev + current;
    }, 0);

    const lastWeek = await Week.getLastWeek();
    const lastWeekDate = lastWeek && dayjs.utc(lastWeek?.start_date);

    const newStartDateIsBeforeLastWeek =
      lastWeekDate &&
      parsedStartDate.isBefore(lastWeekDate.endOf("week").endOf("day"));
    if (newStartDateIsBeforeLastWeek) {
      return response.status(422).json({
        error: "Period already on that date",
      });
    }

    const weekData = necPerWeek.map((nec: number) => {
      const week = { startDate: parsedStartDate.startOf("week").format(), nec };
      parsedStartDate = parsedStartDate.add(1, "week");
      return week;
    });

    await Period.insert(totalNec, weekData);
    response.send({ status: 200 });
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

export const getLastPeriodEndDate = async (_: Request, response: Response) => {
  try {
    const currentWeek = await Week.getCurrent(actualWeekNumber);
    const periodId = currentWeek && currentWeek.fk_period_id;
    const lastWeekFromPeriod = periodId && (await Week.getLastWeekByPeriod(periodId));

    const lastWeekStartDate = lastWeekFromPeriod && dayjs.utc(lastWeekFromPeriod.start_date);
    let currentPeriodEndDate: string | undefined | null | 0 =
      lastWeekStartDate &&
      lastWeekStartDate.endOf("week").endOf("day").format();

    currentPeriodEndDate = currentPeriodEndDate ? currentPeriodEndDate : null;
    response.status(200).json({
      currentPeriodEndDate,
    });
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

router.get("/period/last", getLastPeriodEndDate);
router.post("/period", schedulePeriod);

export default router;
