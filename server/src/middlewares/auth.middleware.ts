import { RequestHandler } from "express"
import jwt from "jsonwebtoken"

export const authMiddleware: RequestHandler = (req, res, next) => {

    if (req.headers.authorization) {
        const token = req.headers.authorization?.split(' ')[1]
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        try {
            const payload = jwt.verify(token!, JWT_SECRET)
            req.user = payload
            next();
        } catch (error) {
            res.status(404).json({ msg: "Something went wrong", error })
        }

    } else {
        return res.status(401).json({ error: "Authorization header missing" });
    }
}