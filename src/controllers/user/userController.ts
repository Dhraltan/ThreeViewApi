import { User } from "../../entities/User";
import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import HttpException from "../../middlewares/exceptions/HttpException";

export class UserController {
  private userRepository = getRepository(User);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    if (!request.query.email) {
      return request.next(new HttpException(400, "Bad Request"));
    }
    await this.userRepository
      .findOneOrFail({ where: { email: request.query.email } })
      .then((user) => {
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

  async save(request: Request, response: Response, next: NextFunction) {
    const user = this.userRepository.create(request.body);
    await this.userRepository
      .save(user)
      .then((result) => {
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

  async remove(request: Request, response: Response, next: NextFunction) {
    let userToRemove = await this.userRepository.findOne(request.params.id);
    await this.userRepository.remove(userToRemove);
  }
}
