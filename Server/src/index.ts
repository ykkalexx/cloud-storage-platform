import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/authRoutes";
import { sequelize } from "./config/database";
import http from "http";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/auth", authRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const startServer = () => {
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

const connectDatabase = () => {
  sequelize
    .sync({ force: false })
    .then(() => console.log("Database connected & tables created"))
    .catch((err) => console.error("Error connecting to the database: ", err));
};

connectDatabase();
startServer();
