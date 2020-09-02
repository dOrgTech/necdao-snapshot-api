import { Strategy, ExtractJwt } from "passport-jwt";

const tokenProperties = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

const getTokenInformation = (jwtPayload: object, done: Function) => {
  return done(null, jwtPayload);
};

export default new Strategy(tokenProperties, getTokenInformation);
