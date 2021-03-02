import { User } from "../../entities/User";
import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import HttpException from "../../middlewares/exceptions/HttpException";

export class UserController {

  async getUserInfo(request: Request, response: Response, next: NextFunction) {
    const userRepository = getRepository(User);
    const email = request.body.jwt.email;
    await userRepository
      .findOneOrFail({ where: { email: email } })
      .then((user) => {
        user.password = null;
        return response.send(user);
      })
      .catch((err) => {
        if ((err.name = "EntityNotFound")) {
          return request.next(
            new HttpException(401, "Requested entity was not found")
          );
        } else {
          return request.next(new HttpException(400, "Bad Request"));
        }
      });
  }
}
