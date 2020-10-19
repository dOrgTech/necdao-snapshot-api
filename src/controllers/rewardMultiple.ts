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
    console.log(request.body);
    const { multiples } = request.body;

    multiples.forEach((multiple: RewardMultipleType) => {
      const hasLimit = "lower_limit" in multiple;
      const hasMultiple = "multiplier" in multiple;
      if (!hasLimit && !hasMultiple) {
        response.send({
          error: true,
          messsage: "Multiples are not well formatted",
        });
      }
    });

    const formattedMultiples = multiples.map(
      ({ lower_limit, multiplier }: any) => ({
        lower_limit,
        multiplier,
      })
    );
    await RewardMultiple.insert(formattedMultiples);

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
router.post("/reward/multiple", create);

export default router;
