import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import {randomBytes} from "crypto";

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

    return await UserCollection.create({
        ...payload,
        password: hashPassword,
      });
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
