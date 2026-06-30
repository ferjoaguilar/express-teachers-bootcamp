export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader?.startsWith('Bearer ')){
        return res.status(401).json({success: false, message: 'Token requerido'})
    }

    const token = authHeader.split(' ')[1]

    
}