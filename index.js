import db from './db/db.js'
import express from 'express';
import cors from 'cors'
import dotenv from'dotenv'
import authRoutes from './routes/authRoutes.js'
dotenv.config()
const app=express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Recipe-Backend Running")
})

app.use('/api/auth',authRoutes)


app.listen(process.env.PORT,()=>{
    console.log(`Server started on port ${process.env.PORT} `)
})