import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";
import { ContactDTO } from "../../interfaces/DTOs/ContactDTO";

export class ContactController {

  transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

   sendEmail = async (request: Request, response: Response, next: NextFunction) => {


    const contactDTO: ContactDTO = request.body;

    await this.transporter
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

  async sendWarningEmail(warnings: {sensor: string; value: number}[]){
    let warningMessage: string = '';
    let htmlWarningMessage: string = '' 
    warnings.forEach((warning)=>{
      warningMessage = warningMessage.concat(`\n${warning.sensor} has detected a value of ${warning.value}`)
      htmlWarningMessage = htmlWarningMessage.concat(`<p>${warning.sensor} has detected a value of ${warning.value};</p>`)
    })
    await this.transporter.sendMail({
      from: `${process.env.EMAIL_USER} <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject:"WARNING",
      text: `Air quality is critical: ${warningMessage}`,
      html: `<h1 style="text-align: center;">Air quality is critical</h1> ${warningMessage}`,
    })
  }
}
