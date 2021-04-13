const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const ServiceRequest = mongoose.model("ServiceRequest");

router.post('/create_service_request',requireLogin,(req,res)=>{
    const {title,description}=req.body;
    if(!title||!description){
        return res.status(422).json({ error: "Please add all field!" });
    }
    
    req.user.password=undefined;
    const serviceRequest=new ServiceRequest({
        title,
        description,
        sentBy:req.user
    })
    serviceRequest.save().then(result=>{
        res.json({serviceRequest:result});
    })
    .catch(err=>{
        console.log(err);
    })
})

module.exports = router;