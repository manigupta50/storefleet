// Please don't change the pre-written code
// Import the necessary modules here

import { ErrorHandler } from '../../../utils/errorHandler.js';
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo
} from '../model/product.repository.js';

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, 'some error occured!'));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const limit = 10;
    const { keyword, page } = req.query;
    const baseQuery = {};

    if (keyword) {
      baseQuery.name = { $regex: new RegExp(keyword, 'i') };
    }
    console.log("b: " + baseQuery.name);
    const totalCount = await getTotalCountsOfProduct();
    // const products = await getAllProductsRepo(
    //   baseQuery,
    //   parseInt(limit),
    //   (page - 1) * limit
    // );
    res.status(200).json({
      success: true,
      data: {
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: 'Internal Server Error' });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, 'Product not found!'));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, 'Product not found!'));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, 'Product not found!'));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, 'Product not found!'));
    }
    const findRevieweIndex = product.reviews.findIndex(rev => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach(rev => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res.status(201).json({ success: true, msg: 'thx for rating the product', product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, 'Product not found!'));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.query;

    if (!productId || !reviewId) {
      return next(
        new ErrorHandler(400, 'Please provide productId and reviewId as query params')
      );
    }

    const product = await findProductRepo(productId);

    if (!product) {
      return next(new ErrorHandler(400, 'Product not found!'));
    }

    const reviews = [...product.reviews]; // Create a copy of the reviews array

    const isReviewExistIndex = reviews.findIndex(
      rev => rev._id.toString() === reviewId.toString()
    );

    if (isReviewExistIndex < 0) {
      return next(new ErrorHandler(400, `Review with ID ${reviewId} doesn't exist`));
    }

    const [deletedReview] = reviews.splice(isReviewExistIndex, 1); // Using destructuring to get the deleted review

    // Save the modified reviews array back to the product
    product.reviews = reviews;
    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      msg: 'Review deleted successfully',
      deletedReview,
      product
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || 'Internal Server Error'));
  }
};
