// App.js
import express from "express";
import cors from "cors";
import { connectDB } from "./DB/Database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";

dotenv.config({ path: "./config/config.env" });

const app = express();
const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Define allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000", // ✅ Local dev
  "https://main.d1sj7cd70hlter.amplifyapp.com", // ✅ AWS Amplify
  "https://expense-tracker-app-three-beryl.vercel.app", // ✅ Vercel
];

// Middleware
app.use(express.json());

// CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Explicitly handle preflight OPTIONS requests
app.options("*", cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Force add CORS headers (Render-specific workaround)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Log origin for debug
app.use((req, res, next) => {
  console.log("Incoming request from:", req.headers.origin);
  next();
});

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routers
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
