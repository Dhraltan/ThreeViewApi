import {User} from "../../entities/User";
import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import bcrypt from "bcrypt";
import HttpException from "../../middlewares/exceptions/HttpException";
import {UserDTO} from "../../interfaces/DTOs/UserDTO";
import {LoginDTO} from "../../interfaces/DTOs/LoginDTO";
import {jwtToken} from "../../utils/jwtToken.util";
import {ChangePasswordDTO} from "../../interfaces/DTOs/ChangePasswordDTO";

export class AuthController {
  async login(request: Request, response: Response, next: NextFunction) {
    const userRepository = getRepository(User);
    const loginData: LoginDTO = request.body;
    await userRepository
      .findOneOrFail({where: {email: request.body.email}})
      .then(async (user) => {
        const isPasswordMatching = await bcrypt.compare(loginData.password, user.password);
        if (isPasswordMatching) {
          user.password = null;
          const tokenData = jwtToken.createToken(user);
          response.setHeader("Set-Cookie", [jwtToken.createCookie(tokenData)]);
          return response.send(user);
        } else {
          return request.next(new HttpException(401, "Password doesn't match!"));
        }
      })
      .catch((err) => {
        if ((err.name = "EntityNotFound")) {
          return request.next(new HttpException(401, "The entity was not found!"));
        } else {
          return request.next(new HttpException(400, "Bad Request"));
        }
      });
  }

  async changePassword(request: Request, response: Response, next: NextFunction) {
    const userRepository = getRepository(User);
    const bodyData: ChangePasswordDTO = request.body;
    await userRepository
      .findOneOrFail({where: {email: request.body.email}})
      .then(async (user) => {
        const isPasswordMatching = await bcrypt.compare(bodyData.oldPassword, user.password);
        if (isPasswordMatching) {
          const hashedPassword = await bcrypt.hash(bodyData.newPassword, 10);
          userRepository.update({id: user.id}, {password: hashedPassword});

          return response.sendStatus(204);
        } else {
          return request.next(new HttpException(401, "Old password doesn't match!"));
        }
      })
      .catch((err) => {
        if ((err.name = "EntityNotFound")) {
          return request.next(new HttpException(401, "The entity was not found!"));
        } else {
          return request.next(new HttpException(400, "Bad Request"));
        }
      });
  }

  async register(request: Request, response: Response, next: NextFunction) {
    const userRepository = getRepository(User);
    const userData: UserDTO = request.body;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await userRepository
      .save({
        ...request.body,
        password: hashedPassword,
      })
      .then((result) => {
        result.password = null;
        return response.sendStatus(204);
      })
      .catch((err) => {
        if (err.code == 23502) {
          return request.next(
            new HttpException(400, `Integrity Constraint Violation: Property ${err.column} is null`)
          );
        } else if (err.code == 23505) {
          return request.next(
            new HttpException(400, `Integrity Constraint Violation: Email already exists`)
          );
        } else {
          return request.next(new HttpException(500, err.detail));
        }
      });
  }

  async logout(request: Request, response: Response, next: NextFunction) {
    response.setHeader("Set-Cookie", ["Authorization='';Max-age=0;Path=/"]);
    response.sendStatus(204);
  }
}
