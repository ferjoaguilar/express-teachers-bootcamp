import "dotenv/config"
import express from 'express'
import userRouter from "./routes/users.routes.js"
import authRouter from './routes/auth.routes.js'
import {apiKeyMiddleware} from "./middleware/apikey.middleware.js"

// CREAR INSTANCIA 
const app = express()
const PORT = process.env.PORT

// ESPECIFICAR JSON
app.use(express.json());

// MIDDLEWARE
app.use(apiKeyMiddleware)

// ENDPOINT
app.use("/", userRouter)
app.use("/auth", authRouter)

// CREAR EL SERVER
app.listen(PORT, () => {
    console.log(`Server running in ${PORT} 🚀🚀🚀`);
})