import {Router} from 'express'
import prisma from "../lib/prisma.js"

const userRouter = Router()

userRouter.get("/", async (req, res) => {
    // BUSCAR EN LA BASE DE DATOS
    
    try {
        const students = await prisma.student.findMany()
        //throw new Error("Fallo la conexion a la base de datos")
        res.status(200).json({success: true, data: students})
    } catch (error) {
        res.status(500).json({success: false, message: "Error interno del servidor"})
    }
  
})

userRouter.post("/create", async (req, res) => {
    // EXTRACCION DE LOS DATOS
   const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body

   // VALIDACION DE LOS DATOS
   if (!studentCode || !firstName || !lastName || !email || !password){
    return res.status(400).json({
        success: false,
        message: "Faltan datos: studentCode, firstName, lastName, email, password son requeridos"
    })
   }

   try {
    
    const newStudent = await prisma.student.create({
       data: {
            studentCode: studentCode,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phone: phone,
            birthDate: birthDate ? new Date(birthDate):null
       }
    })
    res.status(201).json({success: true, message: "Nuevo alumno registrado exitosamente"})
   } catch (error) {
    //console.log(error);
    res.status(500).json({success: false, message: "Error interno del servidor"})
   }


})

userRouter.put("/update/:id", async(req, res) => {
    const { id } = req.params
    const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body


    try {
        const updatedStudent = await prisma.student.update({
            where: {id: parseInt(id) },
            data: {
                studentCode: studentCode,
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                phone: phone,
                birthDate: birthDate ? new Date(birthDate):null
            }
        })
        res.status(200).json({success: true, message: "Registro actualizado exitosamente"})
    } catch (error) {
        res.status(500).json({success: false, message: "Error interno del servidor"})
    }
})

userRouter.delete("/delete/:id", async(req, res) => {
    const { id } = req.params
    try {
        const deletedStudent = await prisma.student.delete({
            where: {id: parseInt(id)}
        })
        res.status(200).json({success: true, data: deletedStudent})
    } catch (error) {
        if(error.code === "P2025"){
            res.status(404).json({success: false, message: "El id seleccionado no fue encontrado"})
        }
        res.status(500).json({success: false, message: "Error interno del servidor"})
    }
})


export default userRouter