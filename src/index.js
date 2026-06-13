import express from 'express'

// CREAR INSTANCIA 
const app = express()
const PORT = 8000

// ESPECIFICAR JSON
app.use(express.json());

// ENDPOINTS
app.get("/", (req, res) => {
    // BUSCAR EN LA BASE DE DATOS
    console.log("Alguien consulto el endpoint");
    res.status(200).json({message: "Endpoint de obtener funcionando"})
})

app.post("/create", (req, res) => {
    const {name, age} = req.body
    if (!name || !age){
        return res.status(400).json({message: "Faltan datos: nombre o edad"})
    }
    res.status(201).json({message: `El usuario ${name} de ${age} se ha creado`})
})

app.put("/update/:id", (req, res) => {
    const { id } = req.params
    const {name, age} = req.body
    if (!name || !age){
        return res.status(400).json({message: "Faltan datos: nombre o edad"})
    }
    res.status(200).json({message: `El usuario con ID: ${id} se ha actualizado`})
})

app.delete("/delete/:id", (req, res) => {
    const { id } = req.params
    res.status(200).json({message: `El usuario con ID: ${id} se ha eliminado`})
})

// MI PRIMER ENDPOINT
app.get("/test", (req, res) => {
    res.status(200).json({ mensaje: "Hola a la formacion de docentes del MINEDUCYT como estas?🙌"})
})

// CREAR EL SERVER
app.listen(PORT, () => {
    console.log(`Server running in ${PORT} 🚀🚀🚀`);
})