import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(port, () => {
	console.log(`Servidor escuchando en el puerto ${port}`);
});
