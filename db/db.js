import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const db=mysql.createPool({
    host :process.env.HOST,
    user:process.env.USER,
    database:process.env.DB_NAME,
    password:process.env.PASSWORD
})

db.getConnection((err)=>{
if(err){
    console.log("failed to connect database",err)
}
else{
console.log("database connected successfully")
} 
})

export default db;