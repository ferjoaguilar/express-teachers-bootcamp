import {Router} from 'express'

const userRouter = Router()

userRouter.get("/", (req, res) => {
    // BUSCAR EN LA BASE DE DATOS
    console.log("Alguien consulto el endpoint");
    res.status(200).json({message: "Endpoint de obtener funcionando"})
})

userRouter.post("/create", (req, res) => {
    const {name, age} = req.body
    if (!name || !age){
        return res.status(400).json({message: "Faltan datos: nombre o edad"})
    }
    res.status(201).json({message: `El usuario ${name} de ${age} se ha creado`})
})

userRouter.put("/update/:id", (req, res) => {
    const { id } = req.params
    const {name, age} = req.body
    if (!name || !age){
        return res.status(400).json({message: "Faltan datos: nombre o edad"})
    }
    res.status(200).json({message: `El usuario con ID: ${id} se ha actualizado`})
})

userRouter.delete("/delete/:id", (req, res) => {
    const { id } = req.params
    res.status(200).json({message: `El usuario con ID: ${id} se ha eliminado`})
})

userRouter.get("/test", (req, res) => {
    res.status(200).json({ mensaje: "Hola a la formacion de docentes del MINEDUCYT como estas?🙌"})
})

export default userRouter