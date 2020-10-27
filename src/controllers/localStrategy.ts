import { Strategy } from "passport-local";
import { User } from "../models";
import { compare } from "bcrypt";

const userProperties = { usernameField: "email", passwordField: "password" };

const getUser = async (email: string, password: string, done: Function) => {
  try {
    const user = await User.get(email);
    const correctPassword = await compare(password, user!.password)
    correctPassword ? done(null, user) : done(null, false);
  } catch (error) {
    console.log(error)
    return done(null, false, { message: "Email not found" });
  }
};

export default new Strategy(userProperties, getUser);
