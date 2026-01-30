import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import path from "path";

dotenv.config({});
const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.resolve();

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I'm comming from backend",
    success: true,
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsOptions));

// yha p apni api ayengi
app.use("/api/v1/user", userRoute);
//"http://localhost:8000/api/v1/user/register"
app.use("/api/v1/post", postRoute);
//"http://localhost:8000/api/v1/post/addPost"
app.use("/api/v1/message", messageRoute);
//"http://localhost:8000/api/v1/message/addMessage"

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`server listen at ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
