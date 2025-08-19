import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export const signup = async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const { data, error } = await supabase.from('users')
        .insert([
            { username : req.body.username, password : hashedPassword }
        ])
        .select()
    
    if (error) {
        res.send(error)
        return
    }

    await signin(req, res)
}

export const signin = async (req, res) => {
    const { data, error } = await supabase.from('users')
        .select('*')
        .eq('username', req.body.username)
        .maybeSingle()
    
    if (error) {
        return res.status(500).json(error)
    }

    if (data === null) {
        return res.status(404).json({ message : "User not found." })
    }

    const passwordIsValid = await bcrypt.compare(req.body.password, data.password)

    if (!passwordIsValid) {
        return res.status(401).json({
            accessToken : null,
            message : 'Invalid Password!',
        })
    }

    const token = jwt.sign({ username : data.username }, process.env.JWT_SECRET, { expiresIn : 86400 })

    res.status(200).json({
        id : data.id,
        username : data.username,
        accessToken : token,
    })
}