import {Router} from "express";

import * as authControllers from "../controllers/auth.js";

import ctrlWrapper from "../utils/ctrlWrapper.js";
import validateBody from "../utils/validateBody.js";

import {userSignupSchema, userSigninSchema} from "../validation/users.js";


//роут для скидання паролю через емейл
import { requestResetEmailSchema } from '../validation/users.js';
import { resetPasswordSchema } from '../validation/users.js';


const authRouter = Router();

authRouter.post("/register", validateBody(userSignupSchema), ctrlWrapper(authControllers.registerController));

authRouter.post("/login", validateBody(userSigninSchema), ctrlWrapper(authControllers.loginController));

authRouter.post("/refresh", ctrlWrapper(authControllers.refreshController));

authRouter.post("/logout", ctrlWrapper(authControllers.logoutController));

authRouter.post('/request-reset-email',validateBody(requestResetEmailSchema),ctrlWrapper(authControllers.requestResetEmailController));

authRouter.post('/reset-password',validateBody(resetPasswordSchema),ctrlWrapper(authControllers.resetPasswordController));
export default authRouter;
