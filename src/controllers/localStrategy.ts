import { Strategy } from "passport-local";
import { User } from "../models";

const userProperties = { usernameField: "email", passwordField: "password" };

const getUser = async (email: string, password: string, done: Function) => {
  try {
    const user = await User.get(email);
    const checkPassword = (isMatch: boolean) => {
      isMatch ? done(null, user) : done(null, false);
    };
    User.authenticate(password).then(checkPassword);
  } catch (error) {
    return done(null, false, { message: "Email not found" });
  }
};

export default new Strategy(userProperties, getUser);
