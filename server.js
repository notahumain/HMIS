import express from 'express'
import cors from 'cors'
import path from 'path'
import {fileURLToPath} from 'url'
import cfg from './config.js'
import authRoutes from './routes/auth.js'
import patientRoutes from './routes/patients.js'
import appointmentRoutes from './routes/appointments.js'
import billingRoutes from './routes/billing.js'
const app=express()
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')))
app.use('/api/auth',authRoutes)
app.use('/api/patients',patientRoutes)
app.use('/api/appointments',appointmentRoutes)
app.use('/api/billing',billingRoutes)
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')))
app.listen(cfg.port,()=>{})