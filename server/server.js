import express, { urlencoded } from 'express'
import cors from 'cors'

const PORT = 8000
const app = express()

app.use(cors())
app.use(express.json())
app.use(urlencoded({ extended : true }))

app.use((req, res) => {
    res.status(404).json({ error : "Path not found" })
})

app.listen(PORT, () => console.log(`Server connected on PORT ${PORT}`))