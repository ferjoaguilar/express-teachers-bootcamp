import "dotenv/config"
import express from 'express'
import userRouter from "./routes/users.routes.js"

// CREAR INSTANCIA 
const app = express()
const PORT = process.env.PORT

// ESPECIFICAR JSON
app.use(express.json());

// ENDPOINT
app.use("/", userRouter)

// CREAR EL SERVER
app.listen(PORT, () => {
    console.log(`Server running in ${PORT} 🚀🚀🚀`);
})