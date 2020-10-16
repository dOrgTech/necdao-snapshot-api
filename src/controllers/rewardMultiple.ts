import { Request, Response, Router } from "express";

import { RewardMultiple } from "../models";
import { RewardMultipleType } from "../models/RewardMultiple";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

const read = async (_: Request, response: Response) => {
  try {
    const multiples = await RewardMultiple.getLast();
    response.send({ multiples });
  } catch (err) {
    console.log("Error ", err);
    response.status(500).json({
      error: true,
      message: "Error getting reward multiples",
    });
  }
};

const create = async (request: Request, response: Response) => {
  try {
    const { multiples } = request.body;

    multiples.forEach((multiple: RewardMultipleType) => {
      const hasLimit = "limit" in multiple;
      const hasMultiple = "multiple" in multiple;
      if (!hasLimit && !hasMultiple) {
        response.send({
          error: true,
          messsage: "Multiples are not well formatted",
        });
      }
    });

    await RewardMultiple.insert(multiples);

    response.json({ status: 200 });
  } catch (err) {
    console.log("Error ", err);
    response.status(500).json({
      error: true,
      message: "Error creating reward multiple",
    });
  }
};

router.get("/reward/multiple", read);
router.post("/reward/multiple", tokenVerify, create);

export default router;
