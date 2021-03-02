import { User } from "../../entities/User";
import { getRepository } from "typeorm";
import { NextFunction,Request,Response } from "express";
import { LoginDTO } from "../../interfaces/DTOs/LoginDTO";
import bcrypt from "bcrypt";
import { jwtToken } from "../../utils/jwtToken.util";
import HttpException from "../../middlewares/exceptions/HttpException";
import jwt from "jsonwebtoken";

export class UserController {
  private userRepository = getRepository(User);

  async getUserInfo(request: Request, response: Response, next: NextFunction) {
    
  const jwtToken = request.cookies.Authorization;
  const secret = process.env.JWT_SECRET;
  console.log(request.cookies)
  const verificationResponse = jwt.verify(jwtToken, secret) as DataStoredInToken;
    await this.userRepository
      .findOneOrFail({ where: { email: verificationResponse.email} })
      .then(async (user) => {
          user.password = null;
          return response.send(user);
        
      })
      .catch((err) => {
        if ((err.name = "EntityNotFound")) {
          return request.next(
            new HttpException(401, "Email is not registered!")
          );
        } else {
          return request.next(new HttpException(400, "Bad Request"));
        }
      });
  }
}