import { scheduleJob, Job } from 'node-schedule';
import { takeSnapshot } from '../services';
 
//0 12 * * */2 -> every tuesday at midday

export class ScheduledJob {
  private static instance: Job | undefined

  private constructor() { }

  public static getInstance = () => {
    if(!ScheduledJob.instance) {
      ScheduledJob.instance = scheduleJob('0 12 * * */2', takeSnapshot);
    }

    return ScheduledJob.instance
  }

  public static reschedule = (newJob: Job) => {
    ScheduledJob.getInstance().cancel()
    ScheduledJob.instance = newJob
  }

}

export const isCronValid = (expression: string) => {
  var cronregex = new RegExp(/^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/);
  return cronregex.test(expression);
}