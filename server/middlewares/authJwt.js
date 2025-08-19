import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"] || req.headers["authorization"]

    if (!token) {
        return res.status(403).json({ message : "No token provided!" })
    }

    const actualToken = token.startsWith("Bearer ") ? token.slice(7, token.length) : token

    jwt.verify(actualToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.send(401).json({ message : "Unauthorized!" })
        }
        req.userId = decoded.id
        next()
    })
}

const authJwt = {
    verifyToken
}

export default authJwt