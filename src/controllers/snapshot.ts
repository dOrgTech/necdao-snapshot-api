import { Router, Request, Response, NextFunction } from "express";

import dayjs, { actualWeekNumber, getCurrentWeek } from "../utils/day";
import { publishWeek, takeSnapshot } from "../services/snapshot";
import { tokenVerify } from "../middlewares/tokenVerify";
import { Reward, Week } from "../models";
import { parse } from "json2csv";
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
      res.send({
        status: 403,
        message: "Snapshot already taken this week",
      });
      return;
    }
    res.send({ status: 200 });
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
      res.send({
        status: 403,
        message: "Results already published this week",
      });
      return;
    }
    await deployTimeLockingContract(published)
    res.send({ status: 200 });
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
      res.send({
        status: 400,
        message: "No week found with this ID",
      });
      return;
    }

    if(!published.closed) {
      res.send({
        status: 400,
        message: "This week has not tried to deploy the contract for the first time",
      });
      return;
    }

    await deployTimeLockingContract(published)
    res.send({ status: 200 });
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
      res.send({
        status: 400,
        message: "No week found with this ID",
      });
      return;
    }

    if(!published.closed || !published.contract_address) {
      res.send({
        status: 400,
        message: "This week has no contract deployed",
      });
      return;
    }

    await addBeneficiaries(published)
    res.send({ status: 200 });
  } catch (err) {
    console.log(err.toString())
    next(err);
  }
};

export const getCurrentSnapshot = async (_: Request, response: Response) => {
  try {
    const currentWeek = await getCurrentWeek();

    if (!currentWeek) {
      response.status(404).json({
        error: true,
        message: "No current week/period",
      });

      return;
    }
    const snapshotTaken = currentWeek.snapshot_date;

    if(!snapshotTaken) {
      response.status(404).json({
        error: true,
        message: "No current snapshot",
      });

      return;
    }
    const formattedSnapshot = dayjs.utc(snapshotTaken).format();
    response.status(200).json({ formattedSnapshot });
  } catch (error) {
    console.log("Error ", error);
    response.status(500).send({ error: true  });
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
      const csv = parse(snapshotData)
      res.header('Content-Type', 'text/csv');
      res.attachment(`snapshot.csv`);
      res.send(csv)
    } else {
      res.send({
        status: 404,
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
router.get("/snapshot/current", getCurrentSnapshot);

export default router;
