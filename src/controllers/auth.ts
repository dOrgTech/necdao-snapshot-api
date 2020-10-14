import { Request, Response, Router } from "express";
import { Secret, sign } from "jsonwebtoken";
import { User, UserType } from "../models";

import { authenticate } from "passport";
import { hash } from "bcrypt";
import { tokenVerify } from "../middlewares/tokenVerify";

const router = Router();

export const auth = async (request: Request, response: Response) => {
  const signIn = (error: Error, user: UserType) => {
    if (error || !user) return response.status(400).json({ error: true, message: 'User not found / Wrong password' });
    request.logIn(user, (error: Error) => {
      if (error) return response.status(400).json({ error: true, message: error });
      const token = sign(user, process.env.SECRET_KEY as Secret);
      return response.status(200).json({ user, token });
    });
  };
  authenticate("local", signIn)(request, response);
};

export const register = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  try {
    let user = await User.get(email);
    if (user) {
      response.status(401).json({ error: true, message: "Email already registered" });
    } else {
      const hashedPassword = await hash(password, 10);
      const userInfo = [email, hashedPassword];
      user = await User.insert(userInfo);
      const token = sign(user!, process.env.SECRET_KEY as Secret);
      response.status(200).json({ user, token });
    }
  } catch (error) {
    console.log("Error ", error);
    response.status(500).json({ error: true });
  }
};

router.post("/login", auth);
router.post("/signup", tokenVerify, register);

export default router;
