import { Router, Request, Response, NextFunction } from "express";
import { takeSnapshot, rescheduleSnapshots } from "../services/snapshot";
import { compressSnapshots } from "../services/snapshot";
import fs from 'fs'
import { isCronValid } from "../utils/scheduler";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router()

const takeSnapshotNow = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const snapshotTaken = await takeSnapshot()
    if(!snapshotTaken) {
      res.send({
        status: 403,
        message: "Snapshot already taken this week"
      })
      return
    }
    res.send({ status: 200 })
  } catch(err) {
    next(err)
  }
}

const getSnapshots = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const path = await compressSnapshots()

    if(path) {
      res.setHeader('Content-type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment');
      res.attachment(`Snapshots.zip`);
  
      const fileStream = fs.createReadStream(path);
      fileStream.pipe(res);
  
      fileStream.on('close', function () {
        fileStream.destroy();
        fs.unlinkSync(path);
      });
    }

  } catch(err) {
    next(err)
  }
}

const scheduleSnapshots = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cronExpression } = req.body

    if(!cronExpression || !isCronValid(cronExpression)) {
      res.status(422).json('Invalid Cron Expression')
    } else {
      rescheduleSnapshots(cronExpression)

      res.status(200).json('Snapshots rescheduled successfully')
    }

  } catch(err) {
    next(err)
  }
}

router.get('/snapshot', /* tokenVerify, */ takeSnapshotNow)
router.get('/snapshot/all', getSnapshots)
router.post('/snapshot/schedule', scheduleSnapshots)

export default router