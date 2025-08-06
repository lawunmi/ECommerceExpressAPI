import express from "express";
import dotenv from "dotenv";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import userRoutes from "./routes/user.route.js";

import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "Health check OK" });
});

app.use(userRoutes);

// Swagger setup
// const swaggerOptions = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "E-commerce API",
//       version: "1.0.0",
//       description: "Express API documentation for E-commerce platform",
//     },
//   },
//   apis: ["./src/routes/**/*.js"], // Path to the API docs
// };

// const swaggerSpec = swaggerJSDoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Load Swagger YAML
const swaggerDocument = YAML.load("src/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
