import express from "express";
import { connectMongoDB } from "../utils/connection";
import dotenv from "dotenv";
import cors from "cors";
import router from "../routes/route";

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//middleware
app.use("/api/v1", router);

async function runServer() {
  try {
    await connectMongoDB();

    app.listen(PORT, () => console.log(`API is running on PORT ${PORT}`));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

runServer();
