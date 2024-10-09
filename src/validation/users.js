import Joi from "joi";

import { emailRegexp } from "../constants/users.js";

export const userSignupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
});

export const userSigninSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().min(6).required(),
});

// схему валідації, 6 модулю
export const requestResetEmailSchema = Joi.object({
    email: Joi.string().email().required(),
  });

// схема валідації зміни паролюб 6 модуль

export const resetPasswordSchema = Joi.object({
    password: Joi.string().required(),
    token: Joi.string().required(),
  });
