import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv"

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

const checkDuplicateUsername = async (req, res, next) => {
    const { data, error } = await supabase.from('users')
        .select('username')
        .eq('username', req.body.username)
        .maybeSingle()
    
    if (error) {
        return res.send(error)
    }

    if (data) {
        return res.status(400).json({ message : "Failed! Username is already in use!" })
    }

    next()
}

const verifySignUp = {
    checkDuplicateUsername,
}

export default verifySignUp