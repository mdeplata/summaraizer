import { createClient } from "@supabase/supabase-js"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { Blob } from 'formdata-node'
import dotenv from "dotenv"

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export const uploadFile = async (req, res) => {
    const fileBuffer = req.file.buffer
    const fileMimeType = req.file.mimetype

    const blob = new Blob([fileBuffer], { type : fileMimeType })
    const loader = new PDFLoader(blob)

    const docs = await loader.load()

    console.log(docs[0])
}