import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from "../lib/prisma.js"

const userRouter = Router()

const studentSchema = z.object({
    studentCode: z.string().min(1, "El código de estudiante es requerido"),
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    email: z.email("El email no tiene un formato válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    phone: z.string().optional(),
    birthDate: z.string().optional(),
})

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        return res.status(400).json({
            success: false,
            errors: result.error.flatten().fieldErrors,
        })
    }
    req.validatedData = result.data
    next()
}

userRouter.get("/", async (_req, res) => {
    try {
        const students = await prisma.student.findMany()
        res.status(200).json({ success: true, data: students })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.post("/create", validate(studentSchema), async (req, res) => {
    const { studentCode, firstName, lastName, email, password, phone, birthDate } = req.validatedData

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newStudent = await prisma.student.create({
            data: {
                studentCode,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone: phone ?? null,
                birthDate: birthDate ? new Date(birthDate) : null,
            }
        })
        res.status(201).json({ success: true, data: newStudent })
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "El campo email ya existe"
            })
        }
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.put("/update/:id", validate(studentSchema), async (req, res) => {
    const { id } = req.params
    const { studentCode, firstName, lastName, email, password, phone, birthDate } = req.validatedData

    try {
        const updatedStudent = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                studentCode,
                firstName,
                lastName,
                email,
                password,
                phone: phone ?? null,
                birthDate: birthDate ? new Date(birthDate) : null,
            }
        })
        res.status(200).json({ success: true, data: updatedStudent })
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: `El estudiante con ID: ${id} no se encuentra en la base de datos`
            })
        }
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.delete("/delete/:id", async (req, res) => {
    const { id } = req.params
    try {
        const deletedStudent = await prisma.student.delete({
            where: { id: parseInt(id) }
        })
        res.status(200).json({ success: true, data: deletedStudent })
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: `El estudiante con ID: ${id} no se encuentra en la base de datos`
            })
        }
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.get("/test", (req, res) => {
    res.status(200).json({ mensaje: "Hola a la formacion de docentes del MINEDUCYT como estas?🙌" })
})

export default userRouter
