require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db/connection");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const categoryRoutes = require("./routes/categoryRoutes");
const questionRoutes = require("./routes/questionRoutes");
const answerRoutes = require("./routes/answersRoutes");

const app = express();

app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});
app.use(limiter);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Favicon
app.get("/favicon.ico", (req, res) => res.status(204));

// Routes
app.use("/categories", categoryRoutes);
app.use("/questions", questionRoutes);
app.use("/answers", answerRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Interview Questions API!");
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
