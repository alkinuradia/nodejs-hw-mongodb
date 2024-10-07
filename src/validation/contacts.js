import Joi from "joi";
import { phoneNumberRegex } from '../constants/contacts.js';
// import { contactList } from "../constants/contacts.js";

export const contactAddSchema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    phoneNumber: Joi.string().pattern(phoneNumberRegex).required(),
    contactType: Joi.string().min(3).max(20).valid('home', 'personal', "work").required(),
    isFavourite: Joi.boolean(),
    email: Joi.string().email().required(),
});

export const contactPatchSchema = Joi.object({
    name: Joi.string().min(3).max(20),
    phoneNumber: Joi.string().pattern(phoneNumberRegex),
	isFavourite: Joi.boolean(),
	contactType: Joi.string().min(3).max(20).valid('home', 'personal', "work"),
    email: Joi.string().email(),
});
