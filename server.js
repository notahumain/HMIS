import express from 'express'
import cors from 'cors'
import path from 'path'
import {fileURLToPath} from 'url'
import cfg from './config.js'
import dotenv from 'dotenv';
dotenv.config({ path: './.env', debug: true });
console.log('ENV TEST:', process.env.DB_USER, process.env.DB_NAME);
import authRoutes from './routes/auth.js'
import patientRoutes from './routes/patients.js'
import appointmentRoutes from './routes/appointments.js'
import billingRoutes from './routes/billing.js'
const app=express()
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
console.log("Static root:", path.join(__dirname, 'public'));
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);

app.get('/', (req,res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.get('/dashboard.html', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
);

app.listen(cfg.port, () => {
  console.log(`✅ Server running at http://localhost:${cfg.port}`);
});
