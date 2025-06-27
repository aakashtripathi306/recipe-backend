import db from '../db/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library';
export const registerUser=async(req,res)=>{
   
try {
     const {username,email,password}=req.body;

    const query="SELECT * FROM users WHERE email=?"

   db.query(query,[email],async(err,result)=>{
  if(err){
    return res.status(500).json({error:"database error"})
  }
  if(result.length>0){
 return res.status(400).json({message:"Email already registered"})
  }
    })

     const hashedpassword=await bcrypt.hash(password,10)

     db.query("INSERT INTO users (name,email,password) values(?,?,?)",[username,email,hashedpassword],async(err,result)=>{
        if(err){
   return res.status(500).json("Something went wrong")
        }
  res.status(200).json({message:"User registered Sucessfully",result})

     })
} catch (error) {
    res.status(500).json({error:"Something went wrong",error})
    console.log("Something went wrong",error)
}
   
}


export const userLogin=async(req,res)=>{
try {
    const {email,password}=req.body;

    db.query("SELECT * FROM users WHERE email=?",[email],async(err,result)=>{
        if(err){
            return res.status(500).json({error:"Databse error",err})
        }
        if(result.length===0){
  return res.status(400).json({error:"no email found"})
        }

        const user=result[0]

        const isMatch=await bcrypt.compare(password,user.password)

    if(!isMatch){
        return res.status(401).json({error:"Inavlid email or password"})
    }

    const token=jwt.sign({id:user.id, email:user.email},
        process.env.JWT_SECRET,
       {expiresIn:"30d"}
    );
res.status(200).json({message:"Login suceesfully",id:user.id, email:user.email,token})
    });
} catch (error) {
    res.status(500).json({error:"Something went wrong"});
    console.log("Something went wrong",error)
}
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error', err });

      if (result.length === 0) {
        // Auto-register new user
        const hashedPassword = await bcrypt.hash(sub, 10);
        db.query(
          'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
          [email, name || 'Google User', hashedPassword],
          (insertErr, insertResult) => {
            if (insertErr) return res.status(500).json({ error: 'User creation failed' });

            const tokenJWT = jwt.sign(
              { id: insertResult.insertId, email },
              process.env.JWT_SECRET,
              { expiresIn: '30d' }
            );
            return res.status(200).json({ message: 'Google login successful', token: tokenJWT });
          }
        );
      } else {
        // Login existing user
        const user = result[0];
        const tokenJWT = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );
        return res.status(200).json({ message: 'Google login successful', token: tokenJWT });
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
};
