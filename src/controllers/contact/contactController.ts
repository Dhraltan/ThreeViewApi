import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";

export class ContactController {
  async sendEmail(request: Request, response: Response, next: NextFunction) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const contactDTO = request.body;

    await transporter
      .sendMail({
        from: `${contactDTO.fullname} <${contactDTO.email}>`,
        to: process.env.EMAIL_USER,
        subject: contactDTO.subject,
        text: `From ${contactDTO.fullname} <${contactDTO.email}>: \n${contactDTO.text}`,
        html: `<h1 style="text-align: center;">From ${contactDTO.fullname}: ${contactDTO.email}</h1> <p>${contactDTO.text}</p>`,
      })
      .then((messageInfo) => {
        return response.status(200).send(messageInfo);
      })
      .catch((err) => {
        return response.status(500).send(err);
      });
  }
}
