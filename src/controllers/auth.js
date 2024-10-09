import * as authServices from "../services/auth.js";
import { ONE_DAY } from "../constants/users.js";
import { requestResetToken } from '../services/auth.js';  //Створимо контролер, який буде обробляти запит на зміну пароля
import { resetPassword } from '../services/auth.js';//Створимо контролер, який буде обробляти запит на зміну пароля


//контролер, який буде обробляти запит на зміну пароля
export const requestResetEmailController = async (req, res) => {
    await requestResetToken(req.body.email);
    res.json({
      message: 'Reset password email was successfully sent!',
      status: 200,
      data: {},
    });
  };

//контролер, який буде обробляти  зміну пароля
export const resetPasswordController = async (req, res) => {
    await resetPassword(req.body);
    res.json({
      message: 'Password was successfully reset!',
      status: 200,
      data: {},
    });
  };



const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + ONE_DAY),
    });
    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + ONE_DAY),
    });
  };


export const registerController = async (req, res) => {
    const newUser = await authServices.register(req.body);

    res.status(201).json({
        status: 201,
        message: "Succsessfully register user",
        data: newUser,
    });
};

export const loginController = async(req, res)=> {
    const session = await authServices.login(req.body);

    setupSession(res, session);

    res.json({
        status: 200,
        message: "Successfully login",
        data: {
            accessToken: session.accessToken,
        }
    });
};

export const refreshController = async(req, res)=> {
    const session = await authServices.refreshSession({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
      });

    setupSession(res, session);

    res.json({
        status: 200,
        message: "Successfully refresh session",
        data: {
            accessToken: session.accessToken,
        }
    });
};

export const logoutController = async(req, res)=> {
    if (req.cookies.sessionId)  {
        await authServices.logout({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
      });
    }

    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");

    res.status(204).send();
};
