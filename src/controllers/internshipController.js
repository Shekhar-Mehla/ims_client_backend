import {
  getAllIntership,
  getIntershipDetailBySlug,
} from "../models/Intership/internshipModel.js";
import { getProfile } from "../models/Profile/profileModel.js";
import responseClient from "../utility/responseClient.js";
import slugify from "slugify";

// get intership list  controller
export const getIntershipController = async (req, res, next) => {
  try {
    const internshipList = await getAllIntership();
    if (!Array.isArray(internshipList)) {
      return responseClient({
        res,
        statusCode: 500,
        message: "Internal server error",
      });
    }
    return responseClient({
      res,
      message: "here is all intership",
      payload: internshipList,
    });
  } catch (error) {
    next(error);
  }
};
// get intership detail controler
export const getIntershipBySlugController = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return responseClient({
        res,
        statusCode: 400,
        message: " slug is requred",
      });
    }

    const getIntership = await getIntershipDetailBySlug(slug);
    if (!getIntership?._id) {
      return responseClient({
        res,
        message: "invalid slug or intership may be closed",
        statusCode: 400,
      });
    }
    return responseClient({
      res,
      message: "here is the detail of the intership",
      payload: getIntership,
    });
  } catch (error) {
    next(error);
  }
};

// Delete internship by ID
