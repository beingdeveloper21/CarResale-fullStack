import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next)=>{
    console.log('=== AUTH MIDDLEWARE ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('All headers:', JSON.stringify(req.headers, null, 2))
    let token = req.headers.authorization || req.headers['x-access-token'] || req.headers['Authorization'] || req.headers['authorization']
    
    if(!token){
        console.log('FAIL: no token in headers')
        return res.status(401).json({success: false, message: "not authorized"})
    }

    if(typeof token === 'string'){
        token = token.trim()
        console.log('Token found, length:', token.length)
        console.log('Token starts with:', token.substring(0, 30))
        if(token.toLowerCase().startsWith('bearer ')){
            token = token.slice(7).trim()
            console.log('Stripped Bearer, new token length:', token.length)
        }
    }

    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = typeof decoded === 'string' ? decoded : decoded?.id
        console.log('Decoded token:', decoded)
        console.log('SUCCESS: userId=', userId)

        if(!userId){
            return res.status(401).json({success: false, message: "not authorized"})
        }
        req.user = await User.findById(userId).select("-password")
        next();
    } catch (error) {
        console.log("VERIFY FAILED:", error.message)
        return res.status(401).json({success: false, message: "not authorized"})
    }
}