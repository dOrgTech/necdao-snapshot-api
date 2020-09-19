import { Request, Response, NextFunction } from "express";
import { authenticate } from "passport";
import { verify, Secret } from "jsonwebtoken";

export const tokenVerify = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authenticateCallback = async (err: Error, jsonwebtoken: object) => {
    const token = request.headers.authorization?.split(" ")[1];
      try {
      if (err || !jsonwebtoken) {
        return response.status(401).json({
          error: true,
          message: "Your token is not valid or null, please log in",
        });
      }
    } catch (e) {
      console.log(e);
    }
    const decoded = verify(token as string, process.env.SECRET_KEY as Secret);
    request.token = decoded;
    next();
  };

  authenticate("jwt", authenticateCallback)(request, response, next);
};
