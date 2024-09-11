import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/authRoutes";
import { sequelize } from "./config/database";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", authRouter);

sequelize
  .sync({ force: false })
  .then(() => console.log("Database connected & tables created"));

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
