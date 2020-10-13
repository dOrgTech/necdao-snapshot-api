import { NextFunction, Request, Response, Router } from "express";
import { addBeneficiaries, deployTimeLockingContract } from "../utils/timelock";
import dayjs, { actualWeekNumber, getCurrentWeek } from "../utils/day";
import { publishWeek, takeSnapshot } from "../services/snapshot";

import { RewardMultiple } from "../models";
import { parse } from "json2csv";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

const read = async (
    request: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rewardMultiples = await RewardMultiple.getAll();

        res.header("Content-Type", "application/json");
        if (rewardMultiples) {
            res.status(200).json(rewardMultiples)
        } else {
            res.status(204);
        }
    } catch (err) {
        console.log("Error ", err);
        res.status(500).json({
            error: true,
            message: "Error getting reward multiples",
        });
    }
};

const update = async (
    request: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rewardMultipleUpdated = undefined;

        res.header("Content-Type", "application/json");
        if (rewardMultipleUpdated) {
            res.status(200).json(rewardMultipleUpdated)
        } else {
            res.status(404).json({
                error: true,
                message: "Reward multiple not found",
            });
        }
    } catch (err) {
        console.log("Error ", err);
        res.status(500).json({
            error: true,
            message: "Error updating reward multiple",
        });
    }
};

const create = async (
    request: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rewardMultiples = undefined;

        res.header("Content-Type", "application/json");
        if (rewardMultiples) {
            res.status(201).json(rewardMultiples)
        } else {
            res.status(500).json({
                error: true,
                message: "Error creating reward multiple",
            });
        }
    } catch (err) {
        console.log("Error ", err);
        res.status(500).json({
            error: true,
            message: "Error creating reward multiple",
        });
    }
};

const del = async (
    request: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rewardMultiples = undefined;

        res.header("Content-Type", "application/json");
        if (rewardMultiples) {
            res.status(200).json(rewardMultiples)
        } else {
            res.status(204);
        }
    } catch (err) {
        console.log("Error ", err);
        res.status(500).json({
            error: true,
            message: "Error deleting reward multiple",
        });
    }
};

router.get("/reward/multiple", read);
router.put("/reward/multiple/:id", tokenVerify, update);
router.post("/reward/multiple/:id", tokenVerify, create)
router.delete("/reward/multiple/:id", tokenVerify, del)

export default router;
