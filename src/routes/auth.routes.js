import {Router} from 'express'
import {success, z} from 'zod'
import bcrypt from 'bcryptjs'
import prisma from "../lib/prisma.js"
import jwt from 'jsonwebtoken'

const authRouter = Router()

const loginSchema = z.object({
    email: z.email("El email enviado es invalido"),
    password: z.string().min(8, "La clave es muy corta").max(24, "La clave es muy larga"),
})

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)
    if(!result.success){
        res.status(400).json({success: false, errors: result.error.flatten().fieldErrors})
    }
    req.validatedData = result.data
    next()
}

authRouter.post('/login',validate(loginSchema), async(req, res) => {
    const {email, password} = req.body

    try {
        const student = await prisma.student.findUnique({where: {email}})
        if (!student){
            return res.status(401).json({success: false, message: "El email no ha sido encontrado"})
        }

        const isPasswordvalid = await bcrypt.compare(password, student.password)

        if (!isPasswordvalid){
            return res.status(401).json({success: false, message: "La clave es invalida"})
        }

        const payload = {id: student.id, email: student.email, studentCode: student.studentCode}
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '8h'})
        res.status(200).json({success: true, access_toke: token})

    } catch (error) {
        res.status(500).json({message: "Error del servidor"})
    }
})

export default authRouter