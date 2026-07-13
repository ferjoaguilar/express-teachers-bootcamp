import "dotenv/config"
import express from 'express'
import cors from 'cors'
import userRouter from "./routes/users.routes.js"
import authRouter from "./routes/auth.router.js"
import { apiKeyMiddleware } from "./middleware/apikey.middleware.js"

// CREAR INSTANCIA
const app = express()
const PORT = process.env.PORT

// CORS abierto: API pública, acepta cualquier dominio
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
}))

// ESPECIFICAR JSON
app.use(express.json());

// MIDDLEWARE
app.use(apiKeyMiddleware)

// ENDPOINT
app.use("/auth", authRouter)
app.use("/", userRouter)
app.use("/auth", authRouter)

// CREAR EL SERVER
app.listen(PORT, () => {
    console.log(`Server running in ${PORT} 🚀🚀🚀`);
})