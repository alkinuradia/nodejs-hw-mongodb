import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import {randomBytes} from "crypto";

//for email

import jwt from "jsonwebtoken";

// import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import "dotenv/config";
import handlebars from "handlebars";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { TEMPLATES_DIR } from "../constants/index.js";


import SessionCollection from "../db/Session.js";
import UserCollection from "../db/user.js";

import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/users.js";

const createSession = ()=> {
    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    };
};

export const register = async (payload)=> {
    const user = await UserCollection.findOne({ email: payload.email });

    if (user) throw createHttpError(409, 'Email in use');

    const hashPassword = await bcrypt.hash(payload.password, 10);

    const createdUser  = await UserCollection.create({
        ...payload,
        password: hashPassword,
      });
      return {
        name: createdUser.name,
        email: createdUser.email,
        _id: createdUser._id,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt
      } ;
};

export const login = async(payload)=> {
    const user = await UserCollection.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(404, 'User not found!');
      }

    const passwordCompare = await bcrypt.compare(payload.password, user.password);
    if(!passwordCompare) {
        throw createHttpError(401, "Unauthorized");
    }

    await SessionCollection.deleteOne({userId: user._id});

    return await SessionCollection.create({
        userId: user._id,
        ...createSession(),
      });
};

export const findSessionByAccessToken = accessToken => SessionCollection.findOne({accessToken});

export const refreshSession = async({refreshToken, sessionId}) => {
    const oldSession = await SessionCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

    if(!oldSession) {
        throw createHttpError(401, "Session not found");
    }

    const isSessionTokenExpired =
    new Date() > new Date(oldSession.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired!');
    }

    await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

    return await SessionCollection.create({
        userId: oldSession.userId,
        ...createSession(),
      });
};

export const logout = async ({ sessionId, refreshToken })=> {
    return await SessionCollection.deleteOne({ _id: sessionId, refreshToken });
};

export const findUser = filter => UserCollection.findOne(filter);


  // 6 модулю
  export const requestResetToken = async (email) => {
    const user = await UserCollection.findOne({email});
    if(!user) {
        throw createHttpError(404, "User not found");
    }

    const resetToken = jwt.sign({
        sub: user._id,
        email,
    },
        env("JWT_SECRET"),
        {
            expiresIn: "30m",
        },
);
console.log(resetToken);
    const resetResetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        "reset-password-email.html",
    );

    const templateSource = (
        await fs.readFile(resetResetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);

    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    await sendEmail({
        from: env('SMTP_FROM'),
        to: email,
        subject: 'Reset Your Password',
        html,
      });
    };

    // console.log(html);


    // try {
    //     await sendEmail({
    //       from: env(SMTP.SMTP_FROM),
    //       to: email,
    //       subject: 'Reset your password',
    //       html,
    //     });
    //   } catch (err) {
    //     console.log(err);
    //     throw createHttpError(
    //       500,
    //       'Failed to send the email, please try again later',
    //     );
    //   }


//     const result = await sendEmail({
//         from: env(SMTP.SMTP_FROM),
//         to: email,
//         subject: "Reset your password",
//         html,

//     })
// // console.log(result);

//     if(!result) {
//         throw createHttpError(500, "Failed to send the email, please try again later.")
//     }


// зміна паролю, 6  модуль
export const resetPassword = async (payload) => {
    let tokenPayload;

    try {
      tokenPayload = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
      console.log(err);
      throw createHttpError(401, 'Token is expired or invalid');
    }

    const user = await UserCollection.findOne({
      email: tokenPayload.email,
      _id: tokenPayload.sub,
    });


    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    // if (!Date.now() > tokenPayload.exp) {
	// 	throw createHttpError(401, 'Token is expired or invalid.');
	// }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UserCollection.updateOne(
      { _id: user._id },
      { password: encryptedPassword },
    );
    await SessionCollection.deleteOne({ userId: user._id });
  };

