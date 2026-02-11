import express from "express";
import connection from "./src/dbConfig.js";
import cors from "cors";
import errorMiddleWare from "./src/middlewares/errorMiddleWare.js";
import authRoutes from "./src/routes/authRoutes.js";
import intershipRoutes from "./src/routes/internshipRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";

import cloudinaryConnection from "./src/cloudinaryConfig.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 8001;
connection()
  .then(() => {
    app.listen(PORT, (error) => {
      if (error) return console.log(error);
      console.log("server is running");
    });
  })
  .catch((error) => {});
cloudinaryConnection();

app.get("/", (req, res) => {
  res.send("server is live");
});
app.use(cors());
app.use(express.json());

// auth routes
app.use("/api/v1/auth", authRoutes);
// internship routes
app.use("/api/v1/internship", intershipRoutes);
// application routes
app.use("/api/v1/application", applicationRoutes);
// notification routes
app.use("/api/v1/notification", notificationRoutes);
// write everything above do not touch these error middelware
app.use((req, res, next) => {
  const error = new Error(`not found ${req.originalUrl}`);
  error.stausCode = 404;
  next(error);
});
app.use(errorMiddleWare);
