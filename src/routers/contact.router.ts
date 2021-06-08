import express from "express";
import { ContactController } from "../controllers/contact/contactController";

const contactRouter = express.Router();
const path = "/api/contact";
const contactController = new ContactController();

contactRouter.post(`${path}/email`, contactController.sendEmail);

export { contactRouter };
