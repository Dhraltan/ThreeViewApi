import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { TokenData } from "../interfaces/ViewModels/TokenData";

export class jwtToken {
  public static createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      email: user.email,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn: expiresIn }),
    };
  }

  public static createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Path=/; Max-Age=${tokenData.expiresIn}`;
  }
}
