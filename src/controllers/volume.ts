import { NextFunction, Request, Response, Router } from "express";

import { getLast24HoursVolume } from "../services/diversifiApi";

const router = Router();

const getLast24HoursVolumeWrapper = async (
  request: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const volume = await getLast24HoursVolume();

    if (volume) {
      res.header("Content-Type", "application/json");
      res.status(200).json(volume)
    } else {
      res.status(500).json({
        error: true,
        message: "No volume data found",
      });
    }
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({
      error: true,
      message: "No volume data found",
    });
  }
};

router.get("/volume", getLast24HoursVolumeWrapper);

export default router;
