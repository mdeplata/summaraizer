import express from 'express'
import { queryVectorStore } from '../controllers/vector.controller.js'

const router = express.Router()

router.post('/', queryVectorStore)

export default router