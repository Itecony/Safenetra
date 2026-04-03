import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes/route.js";
import {
    error_handler,
    not_found_handler
} from "./middlewares/error_handler.js";

const app = express();

// Security & logging
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// API routes
app.use("/api/v1", routes);

// 404
app.use(not_found_handler);

// Global error handler
app.use(error_handler);

export default app;
