import express from "express";
import {
  getIntershipBySlugController,
  getIntershipController,
} from "../controllers/internshipController.js";
import { userAuthMiddleware } from "../middlewares/authMiddleware.js";

const intershipRoutes = express.Router();

// Create internship (protected)

// Get all internships (public)
intershipRoutes.get("/all-internships", getIntershipController);

// Get internship by slug (public)
intershipRoutes.get("/:slug", getIntershipBySlugController);

export default intershipRoutes;
