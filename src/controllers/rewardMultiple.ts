import { NextFunction, Request, Response, Router } from "express";

import { RewardMultiple } from "../models";
import { RewardMultipleType } from "../models/RewardMultiple";
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
        const { id } = request.params;
        const { volume_minimum, reward_multiple } = request.body;
        if (volume_minimum === null || volume_minimum === "" ||
            reward_multiple === null || reward_multiple === "" ||
            id === null || id === "") {
            res.status(400).json({
                error: true,
                message: "Values cannot be null or empty",
            });
            return;
        }

        const rewardMultiple: RewardMultipleType =
            { volume_minimum: Number(volume_minimum), reward_multiple: Number(reward_multiple), id: Number(id) };

        await RewardMultiple.update(rewardMultiple);

        res.header("Content-Type", "application/json");
        if (rewardMultiple) {
            res.status(200).json(rewardMultiple)
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
        const { volume_minimum, reward_multiple } = request.body;
        if (volume_minimum === null || volume_minimum === "" ||
            reward_multiple === null || reward_multiple === "") {
            res.status(400).json({
                error: true,
                message: "Values cannot be null or empty",
            });
            return;
        }

        const rewardMultiples: RewardMultipleType[] =
            [{ volume_minimum: Number(volume_minimum), reward_multiple: Number(reward_multiple) }]

        await RewardMultiple.insert(rewardMultiples);

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
        const { id } = request.params;
        if (id === null || id === "") {
            res.status(400).json({
                error: true,
                message: "Id cannot be null or empty",
            });
            return;
        }

        const idNumber = Number.parseInt(id);

        await RewardMultiple.del(idNumber);
        res.header("Content-Type", "application/json");
        res.status(200).json(idNumber);
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
router.post("/reward/multiple", tokenVerify, create)
router.delete("/reward/multiple/:id", tokenVerify, del)

export default router;
