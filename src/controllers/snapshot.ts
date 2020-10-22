import { Router, Request, Response, NextFunction } from "express";

import { publishWeek, takeSnapshot } from "../services/snapshot";
import { tokenVerify } from "../middlewares/tokenVerify";
import { Reward, Week } from "../models";
import { addBeneficiaries, deployTimeLockingContract } from "../utils/timelock";

const router = Router();

const takeSnapshotNow = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = request.params
    const snapshotTaken = await takeSnapshot(id);
    if (!snapshotTaken) {
      res.status(403).json({
        error: true,
        message: "Snapshot already taken this week",
      });
      return;
    }
    res.status(200).json({});
  } catch (err) {
    next(err);
  }
};

const publishResultsNow = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = request.params
    const published = await publishWeek(id);

    console.log("PUBLISHED ", published)

    if (!published) {
      res.status(403).json({
        error: true,
        message: "Results already published this week",
      });
      return;
    }
    await deployTimeLockingContract(published)
    res.status(200).json({ });
  } catch (err) {
    console.log(err.toString())
    next(err);
  }
};

const redeployContract = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = request.params
    const published = await Week.getWeekById(id)

    if (!published) {
      res.status(400).json({
        error: true,
        message: "No week found with this ID",
      });
      return;
    }

    if(!published.closed) {
      res.status(400).json({
        error: true,
        message: "This week has not tried to deploy the contract for the first time",
      });
      return;
    }

    await deployTimeLockingContract(published)
    res.status(200).json({ });
  } catch (err) {
    console.log(err.toString())
    next(err);
  }
};

const reAddBeneficiaries = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = request.params
    const published = await Week.getWeekById(id)

    if (!published) {
      res.status(400).json({
        error: true,
        message: "No week found with this ID",
      });
      return;
    }

    if(!published.closed || !published.contract_address) {
      res.status(400).json({
        error: true,
        message: "This week has no contract deployed",
      });
      return;
    }

    await addBeneficiaries(published)
    res.status(200).json({ });
  } catch (err) {
    console.log(err.toString())
    next(err);
  }
};

const getSnapshotCsv = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { id } = request.params
    const snapshotData = await Reward.getAllFromWeek(id)

    if(snapshotData) {
      res.status(200).json({ snapshotData })
    } else {
      res.status(404).json({
        error: true,
        message: "No rewards for this week yet",
      });
    }
  } catch (err) {
    next(err);
  }
};

router.post("/snapshot/take/:id", tokenVerify, takeSnapshotNow);
router.post("/snapshot/publish/:id", tokenVerify, publishResultsNow);
router.post("/snapshot/redeploy/:id", tokenVerify, redeployContract)
router.post("/snapshot/addBeneficiaries/:id", tokenVerify, reAddBeneficiaries)
router.get("/snapshot/csv/:id", tokenVerify, getSnapshotCsv);

export default router;
