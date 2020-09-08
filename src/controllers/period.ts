import { Router, Request, Response } from "express";
import { authenticate } from "passport";
import { sign, Secret } from "jsonwebtoken";

import { Period, PeriodType } from "../models/Period";

const router = Router();

export const register = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  try {
    let user = await Period.get(email);
    if (user) {
      response.send({ status: 401, message: "Email already registered" });
    } else {
      const userInfo = [email, password];
      user = await Period.insert(userInfo);
      const token = sign(user!, process.env.SECRET_KEY as Secret);
      response.send({ status: 200, user, token });
    }
  } catch (error) {
    console.log("Error ", error);
    response.send({ status: 500 });
  }
};

router.post("/period", register);

export default router;
