import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../lib/supabase.js'

const authRouter = Router()

const loginSchema = z.object({
    email: z.email("El email no tiene un formato válido"),
    password: z.string().min(1, "La contraseña es requerida"),
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

authRouter.post('/login', validate(loginSchema), async (req, res) => {
    const { email, password } = req.validatedData

    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .maybeSingle()

        if (error) throw error

        if (!student || !(await bcrypt.compare(password, student.password))) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
        }

        const payload = { id: student.id, email: student.email, studentCode: student.studentCode }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' })

        res.status(200).json({ success: true, token })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' })
    }
})

export default authRouter
