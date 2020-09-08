import { Router, Request, Response } from "express";
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Period } from "../models/Period";
dayjs.Ls.en.weekStart = 1;

const router = Router();

dayjs.extend(utc)

export const schedulePeriod = async (request: Request, response: Response) => {
  const { weeks, nec_to_distribute, start_date } = request.body;
  try {
    const weekData = [];
    let parsedStartDate = dayjs.utc(start_date)

    for(let i = 0; i < weeks; i++) {
      weekData.push({ startDate: parsedStartDate.startOf('week').format(), nec: 0 })
      parsedStartDate = parsedStartDate.add(1, 'week')
    }

    await Period.insert(nec_to_distribute, weekData);

    response.status(200)
    
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

router.post("/period", schedulePeriod);

export default router;
