import express from 'express'
import { configDotenv } from 'dotenv'
import  log  from './log.ts'
import { startDb } from './service/db.ts'
import router from './routes/main.ts'
import { returnLink } from './service/linkService.ts'

configDotenv()

const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())
app.use('/api', router)

app.get('/:path', returnLink)

startDb()

app.listen(PORT, ()=>{
    log.debug("Server rodando na porta: ", PORT)
})