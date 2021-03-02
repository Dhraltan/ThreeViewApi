import { User } from "../../entities/User";
import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import HttpException from "../../middlewares/exceptions/HttpException";
import { UserDTO } from "../../interfaces/DTOs/UserDTO";
import { LoginDTO } from "../../interfaces/DTOs/LoginDTO";
import { jwtToken } from "../../utils/jwtToken.util";

export class AuthController {
  private userRepository = getRepository(User);

  async login(request: Request, response: Response, next: NextFunction) {
    const loginData: LoginDTO = request.body;
    console.log(request.cookies)
    await this.userRepository
      .findOneOrFail({ where: { email: request.body.email } })
      .then(async (user) => {
        const isPasswordMatching = await bcrypt.compare(
          loginData.password,
          user.password
        );
        if (isPasswordMatching) {
          user.password = null;
          const tokenData = jwtToken.createToken(user);
          response.setHeader('Set-Cookie', [jwtToken.createCookie(tokenData)]);
          return response.send(user);
        } else {
          return request.next(
            new HttpException(401, "Password doesn't match!")
          );
        }
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

  async register(request: Request, response: Response, next: NextFunction) {
    const userData: UserDTO = request.body;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await this.userRepository
      .save({
        ...request.body,
        password: hashedPassword,
      })
      .then((result) => {
        result.password = null;
        const tokenData = jwtToken.createToken(result);
        response.setHeader('Set-Cookie', [jwtToken.createCookie(tokenData)]);
        return response.status(200).send(result);
      })
      .catch((err) => {
        if (err.code == 23502) {
          return request.next(
            new HttpException(
              400,
              `Integrity Constraint Violation: Property ${err.column} is null`
            )
          );
        } else if (err.code == 23505) {
          return request.next(
            new HttpException(
              400,
              `Integrity Constraint Violation: Email already exists`
            )
          );
        } else {
          return request.next(new HttpException(500, err.detail));
        }
      });
  }
}
