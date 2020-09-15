import { Router, Request, Response } from "express";
import { authenticate } from "passport";
import { sign, Secret } from "jsonwebtoken";

import { User, UserType } from "../models";

const router = Router();

export const auth = async (request: Request, response: Response) => {
  const signIn = (error: Error, user: UserType) => {
    if (error || !user) return response.send({ status: 400 });
    request.logIn(user, (error: Error) => {
      if (error) return response.send(error);
      const token = sign(user, process.env.SECRET_KEY as Secret);
      return response.send({ status: 200, user, token });
    });
  };
  authenticate("local", signIn)(request, response);
};

export const register = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  try {
    let user = await User.get(email);
    if (user) {
      response.send({ status: 401, message: "Email already registered" });
    } else {
      const userInfo = [email, password];
      user = await User.insert(userInfo);
      const token = sign(user!, process.env.SECRET_KEY as Secret);
      response.send({ status: 200, user, token });
    }
  } catch (error) {
    console.log("Error ", error);
    response.status(500).send({ error: true  });
  }
};

router.post("/login", auth);
router.post("/signup", register);

export default router;
