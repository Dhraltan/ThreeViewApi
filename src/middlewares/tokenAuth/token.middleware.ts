import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";

async function tokenMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET;
    try {
      const verificationResponse = jwt.verify(cookies.Authorization, secret);
      request.body.jwt = verificationResponse;
      next();
    } catch (error) {
      next(new HttpException(401, "Wrong jwtToken"));
    }
  } else {
    next(new HttpException(401, "jwt is missing"));
  }
}

export default tokenMiddleware;
