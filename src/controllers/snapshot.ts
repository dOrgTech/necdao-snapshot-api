import { Router, Request, Response, NextFunction } from "express";
import { takeSnapshot } from "../services/snapshot";
import { compressSnapshots } from "../services/snapshot";
import fs from 'fs'
import { ScheduledJob } from "../utils/scheduler";

const router = Router()

const takeSnapshotNow = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const snapshotData = await takeSnapshot()
    if(snapshotData) {
      res.header('Content-Type', 'text/csv');
      res.attachment(`snapshot.csv`);
      res.send(snapshotData)
    }
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

const scheduleSnapshots = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const job = ScheduledJob.getInstance()
  } catch(err) {
    next(err)
  }
}

router.get('/snapshot', takeSnapshotNow)
router.get('/snapshot/all', getSnapshots)
router.get('/snapshot/schedule', scheduleSnapshots)

export default router