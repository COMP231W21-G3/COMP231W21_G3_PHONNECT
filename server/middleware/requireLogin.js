const jwt=require('jsonwebtoken');
const {JWT_SECRET} =require('../config/keys');
const mongoose=require('mongoose');
const User=mongoose.model("User");

module.exports=(req,res,next)=>{
    const {authorization}=req.headers;
    //authorization === Bearer <token>
    res.header("Access-Control-Allow-Origin","*");

    if(!authorization){
        return res.status(401).json({error:"Authorization header missing"});       
    }
    const token=authorization.replace("Bearer ","");

    jwt.verify(token,JWT_SECRET,(err,payload)=>{
        if(err){
            return res.status(401).json({error:"You must be signed in"});
        }

        const {_id}=payload;
        User.findById(_id).then(userdata=>{
            req.user=userdata;
            next(); //dont use next() outside. u want to get req.user first before next()
        })
    })
};