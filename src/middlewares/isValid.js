import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";


const isValidId = (req, res, next) => {
    const {id} = req.params;
//     console.log(id);  // выводим значение переменной
// process.exit();

    if (!isValidObjectId(id)) {
      return next(createHttpError(400, 'Invalid id format'));
    }

    next();
};

export default isValidId;
