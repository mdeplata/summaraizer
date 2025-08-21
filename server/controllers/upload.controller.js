import { createClient } from "@supabase/supabase-js"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { OpenAIEmbeddings } from "@langchain/openai"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
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
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize : 1000,
        chunkOverlap : 200,
    })

    const chunks = await splitter.splitDocuments(docs)

    const openaiAPIKey = process.env.OPENAI_API_KEY
    const embeddings = new OpenAIEmbeddings({ openaiAPIKey })

    await SupabaseVectorStore.fromDocuments(
        chunks,
        embeddings,
        {
            client : supabase,
            tableName : 'documents'
        }
    )
}