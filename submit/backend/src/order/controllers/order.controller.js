// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from '../model/order.repository.js';
import { ErrorHandler } from '../../../utils/errorHandler.js';

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const newOrder = await createNewOrderRepo({
      ...req.body,
      createdBy: req.user._id
    });
    if (newOrder) {
      res.status(201).json({ success: true, newOrder });
    } else {
      return next(new ErrorHandler(400, 'some error occured!'));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
