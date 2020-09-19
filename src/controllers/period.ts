import { Router, Request, Response } from "express";

import dayjs, { actualWeekNumber, getCurrentPeriodId, getCurrentWeek, todayTimestamp } from "../utils/day";
import { Period } from "../models";
import { Week } from "../models";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

export const schedulePeriod = async (request: Request, response: Response) => {
  const { necPerWeek, start_date } = request.body;

  try {
    let parsedStartDate = dayjs.utc(start_date);

    const totalNec = (necPerWeek as number[]).reduce((prev, current) => {
      return prev + current;
    }, 0);

    const lastWeek = await Week.getLastWeek();
    const lastWeekEndDate = lastWeek && dayjs.utc(lastWeek.end_date);

    const newStartDateIsBeforeLastWeek =
      lastWeekEndDate && parsedStartDate.isBefore(lastWeekEndDate);
    if (newStartDateIsBeforeLastWeek) {
      return response.status(400).json({
        error: "Period already on that date",
      });

      return;
    }

    const weekData = necPerWeek.map((nec: number) => {
      const start = parsedStartDate.clone();
      let end;

      if (process.env.DEVELOPMENT === "true") {
        end = parsedStartDate.add(2, "hour");
      } else {
        end = parsedStartDate.add(1, "week");
      }

      parsedStartDate = end.clone().add(1, "second");

      const week = { startDate: start.format('YYYY-MM-DDTHH:mm:ssZ'), endDate: end.format('YYYY-MM-DDTHH:mm:ssZ'), nec };
      return week;
    });

    await Period.insert(totalNec, weekData);
    response.status(200).json({ });
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true });
  }
};

interface PeriodDates {
  startDate: string
  endDate: string
}

interface PeriodsDates {
  current?: PeriodDates
  next?: PeriodDates
  last?: PeriodDates
}

export const getCurrentPeriodDates = async (
  _: Request,
  response: Response
) => {
  try {
    const currentPeriodId = await getCurrentPeriodId()
    let result: PeriodsDates = {}

    if(currentPeriodId) {
      const currentPeriodDates = await Period.getDates(currentPeriodId.toString())
      result.current = currentPeriodDates
    }

    const nextPeriod = await Period.getNextPeriodId(todayTimestamp(), currentPeriodId.toString())
    const nextPeriodId = nextPeriod && nextPeriod.id
    
    if(nextPeriodId) {
      const nextPeriodDates = await Period.getDates(nextPeriodId.toString())
      result.next = nextPeriodDates
    }

    const lastPeriod = await Period.getLastPeriodId(todayTimestamp(), currentPeriodId.toString())
    const lastPeriodId = lastPeriod && lastPeriod.id

    if(lastPeriodId) {
      const lastPeriodDates = await Period.getDates(lastPeriodId.toString())
      result.last = lastPeriodDates
    }

    console.log(currentPeriodId, nextPeriodId, lastPeriodId)

    response.status(200).json(result);
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true });
  }
};

router.get("/period/dates", getCurrentPeriodDates);
router.post("/period", tokenVerify, schedulePeriod);

export default router;
