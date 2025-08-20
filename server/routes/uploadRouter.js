import express from 'express'
import { uploadFile } from '../controllers/upload.controller.js'

const router = express.Router()

router.post('/', uploadFile)

export default router