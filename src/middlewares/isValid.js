import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";


const isValidId = (req, res, next) => {
    const id = req.params.contactId;

    if (!isValidObjectId(id)) {
      return next(createHttpError(400, 'Invalid id format'));
    }

    next();
};

export default isValidId;
