import { scheduleJob, Job } from "node-schedule";
import { takeSnapshot, publishWeek } from "../services";

export class ScheduledJob {
  private static instance: Job | undefined;

  private constructor() {}

  public static getInstance = () => {
    if (!ScheduledJob.instance) {
      //0 16 * * */0 -> every sunday at afternoon (16:00)
      ScheduledJob.instance = scheduleJob("0 16 * * */0", async () => {
        console.log("Running job!");
        await takeSnapshot();
        await publishWeek();
      });
    }

    return ScheduledJob.instance;
  };
}
