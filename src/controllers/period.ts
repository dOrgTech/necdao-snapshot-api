import { Router, Request, Response } from "express";
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Period } from "../models/Period";
dayjs.Ls.en.weekStart = 1;

const router = Router();

dayjs.extend(utc)

export const schedulePeriod = async (request: Request, response: Response) => {
  const { necPerWeek, start_date } = request.body;
  try {
    let parsedStartDate = dayjs.utc(start_date)

    const totalNec = (necPerWeek as number[]).reduce((prev, current) => {
      return prev + current
    }, 0)

    const weekData = necPerWeek.map((nec: number) => {
      const week = { startDate: parsedStartDate.startOf('week').format(), nec }
      parsedStartDate = parsedStartDate.add(1, 'week')
      return week
    })

    await Period.insert(totalNec, weekData);

    response.status(200)
    
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

router.post("/period", schedulePeriod);

export default router;
