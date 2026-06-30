import {Router} from 'express'
import prisma from "../lib/prisma.js"
import {z} from 'zod'
import bcrypt from 'bcryptjs'

const userRouter = Router()

const studentSchema = z.object({
    studentCode: z.string().min(5, "El codigo de estudiante debe tener minimo 5 caracteres"),
    firstName: z.string().min(3, "El nombre debe tener minimo 3 caracteres").max(20, "El nombre es muy largo"),
    lastName: z.string().min(3, "El apellido debe tener minimo 3 caracteres").max(20, "El apellido es muy largo"),
    email: z.email("El email no tiene un formato invalido"),
    password: z.string().min(8, "La clave es muy corta").max(24, "La clave es muy larga"),
    phone: z.string().optional(),
    birthDate: z.string().optional()
})

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if(!result.success){
        res.status(400).json({success: false, errors: result.error.flatten().fieldErrors})
    }
    req.validatedData = result.data
    next()
}

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

userRouter.post("/create",validate(studentSchema), async (req, res) => {
    // EXTRACCION DE LOS DATOS
   const {studentCode, firstName, lastName, email, password, phone, birthDate} = req.body
   
   try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const newStudent = await prisma.student.create({
       data: {
            studentCode: studentCode,
            firstName: firstName,
            lastName: lastName,
            email: email.trim().lowercase(),
            password: hashedPassword,
            phone: phone,
            birthDate: birthDate ? new Date(birthDate):null
       }
    })
    res.status(201).json({success: true, message: "Nuevo alumno registrado exitosamente"})
   } catch (error) {
    console.log(error);
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