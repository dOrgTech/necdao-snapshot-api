import { Router, Request, Response } from "express";
import dayjs, { actualWeekNumber } from '../utils/day'
import { Period } from "../models/Period";
import { Week } from "../models/Week";

const router = Router();


export const schedulePeriod = async (request: Request, response: Response) => {
  const { necPerWeek, start_date } = request.body;
  
  try {
    let parsedStartDate = dayjs(start_date)

    const totalNec = (necPerWeek as number[]).reduce((prev, current) => {
      return prev + current
    }, 0)

    const lastWeek = await Week.getLastWeek()
    const lastWeekDate = lastWeek && dayjs.utc(lastWeek?.start_date)
    
    if(lastWeekDate && parsedStartDate.isBefore(lastWeekDate.endOf('week').endOf('day'))) {
      response.status(422).json({
        error: 'Period already on that date'
      })

      return
    }

    const weekData = necPerWeek.map((nec: number) => {
      const week = { startDate: parsedStartDate.startOf('week').format(), nec }
      parsedStartDate = parsedStartDate.add(1, 'week')
      return week
    })

    await Period.insert(totalNec, weekData);
    response.send({ status: 200 })
    
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

export const getLastPeriodEndDate = async (_: Request, response: Response) => {
  try {
    const currentWeek = await Week.getCurrent(actualWeekNumber())
    const periodId = currentWeek && currentWeek.fk_period_id
    const lastWeekFromPeriod = periodId && await Week.getLastWeekByPeriod(periodId)

    const lastWeekStartDate = lastWeekFromPeriod && dayjs.utc(lastWeekFromPeriod.start_date)
    const currentPeriodEndDate = lastWeekStartDate && lastWeekStartDate.endOf('week').endOf('day').format()

    if(currentPeriodEndDate) {
      response.status(200).json({
        currentPeriodEndDate
      })
    } else {
      response.status(200).json({
        currentPeriodEndDate: null
      })
    }
    
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

router.get("/period/last", getLastPeriodEndDate)
router.post("/period", schedulePeriod);

export default router;
