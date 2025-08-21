import { createClient } from "@supabase/supabase-js"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables"
import dotenv from "dotenv"

dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const openaiAPIKey = process.env.OPENAI_API_KEY
const llm = new ChatOpenAI({ openaiAPIKey})

const embeddings = new OpenAIEmbeddings({ openaiAPIKey })
const vectorStore = new SupabaseVectorStore(embeddings, {
    supabase,
    tableName : 'documents',
    queryName : 'match_documents'
})
const retriever = vectorStore.asRetriever()

const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
conversation history: {conv_history}
question: {question} 
standalone question:`
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {conv_history}
question: {question}
answer: `
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)

const standaloneQuestionChain = standaloneQuestionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const retrieverChain = RunnableSequence.from([
    prevResult => prevResult.standalone_question,
    retriever,
    combineDocuments
])
const answerChain = answerPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())

const chain = RunnableSequence.from([
    {
        standalone_question: standaloneQuestionChain,
        original_input: new RunnablePassthrough()
    },
    {
        context: retrieverChain,
        question: ({ original_input }) => original_input.question,
        conv_history: ({ original_input }) => original_input.conv_history
    },
    answerChain
])

const convHistory = []

function formatConvHistory(messages) {
    return messages.map((message, i) => {
        if (i % 2 === 0){
            return `Human: ${message}`
        } else {
            return `AI: ${message}`
        }
    }).join('\n')
}

// function to retrieve information from vector store (answer user question)
export const queryVectorStore = async (req, res) => {
    try {

        const { userQuery } = req.body

        const aiResponse = await chain.invoke({
            question : userQuery,
            conv_history : formatConvHistory(convHistory)
        })

        convHistory.push(userQuery)
        convHistory.push(aiResponse)
        
        
        res.send(200).json({ aiResponse : aiResponse })

    } catch (err) {
        res.send(500).json({ error : `Error getting AI Response : ${err}`})
    }
}