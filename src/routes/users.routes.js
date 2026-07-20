import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import supabase from "../lib/supabase.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

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

userRouter.get("/", authMiddleware, async (_req, res) => {
    try {
        const { data: students, error } = await supabase
            .from("students")
            .select("*")

        if (error) throw error

        res.status(200).json({ success: true, data: students })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.post("/create", validate(studentSchema), async (req, res) => {
    const { studentCode, firstName, lastName, email, password, phone, birthDate } = req.validatedData

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const { data: newStudent, error } = await supabase
            .from("students")
            .insert({
                studentCode,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone: phone ?? null,
                birthDate: birthDate ? new Date(birthDate).toISOString() : null,
            })
            .select()
            .single()

        if (error) {
            // 23505 = violación de índice único en Postgres
            if (error.code === "23505") {
                const field = error.details?.includes("studentCode") ? "studentCode" : "email"
                return res.status(409).json({
                    success: false,
                    message: `El campo ${field} ya existe`
                })
            }
            throw error
        }

        res.status(201).json({ success: true, data: newStudent })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.put("/update/:id", authMiddleware, validate(studentSchema), async (req, res) => {
    const { id } = req.params
    const { studentCode, firstName, lastName, email, password, phone, birthDate } = req.validatedData

    try {
        const { data: updatedStudent, error } = await supabase
            .from("students")
            .update({
                studentCode,
                firstName,
                lastName,
                email,
                password,
                phone: phone ?? null,
                birthDate: birthDate ? new Date(birthDate).toISOString() : null,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", parseInt(id))
            .select()
            .maybeSingle()

        if (error) {
            // 23505 = violación de índice único en Postgres
            if (error.code === "23505") {
                const field = error.details?.includes("studentCode") ? "studentCode" : "email"
                return res.status(409).json({
                    success: false,
                    message: `El campo ${field} ya existe`
                })
            }
            throw error
        }

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: `El estudiante con ID: ${id} no se encuentra en la base de datos`
            })
        }

        res.status(200).json({ success: true, data: updatedStudent })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
    const { id } = req.params
    try {
        const { data: deletedStudent, error } = await supabase
            .from("students")
            .delete()
            .eq("id", parseInt(id))
            .select()
            .maybeSingle()

        if (error) throw error

        if (!deletedStudent) {
            return res.status(404).json({
                success: false,
                message: `El estudiante con ID: ${id} no se encuentra en la base de datos`
            })
        }

        res.status(200).json({ success: true, data: deletedStudent })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.get("/test", (req, res) => {
    res.status(200).json({ mensaje: "Hola a la formacion de docentes del MINEDUCYT como estas?🙌" })
})

userRouter.get("/subjects", authMiddleware, async (_req, res) => {
    try {
        const { data: subjects, error } = await supabase
            .from("subjects")
            .select("*")

        if (error) throw error

        res.status(200).json({ success: true, data: subjects })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

userRouter.get("/grades", authMiddleware, async (_req, res) => {
    try {
        const { data: grades, error } = await supabase
            .from("grades")
            .select("*, students(id, studentCode, firstName, lastName), subjects(id, code, name)")

        if (error) throw error

        res.status(200).json({ success: true, data: grades })
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
})

export default userRouter
