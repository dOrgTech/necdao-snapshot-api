import { scheduleJob, Job } from 'node-schedule';
import { takeSnapshot } from '../services';
 
export class ScheduledJob {
  private static instance: Job | undefined

  private constructor() { }

  public static getInstance = () => {
    if(!ScheduledJob.instance) {
      ScheduledJob.instance = scheduleJob('*/1 * * * *', takeSnapshot);
    }

    return ScheduledJob.instance
  }

  public static reschedule = (newJob: Job) => {
    ScheduledJob.getInstance().cancel()
    ScheduledJob.instance = newJob
  }

}