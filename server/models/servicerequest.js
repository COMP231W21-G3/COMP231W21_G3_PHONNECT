const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const servicerquestSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    sentBy:{
        type:ObjectId,
        ref:"User"
    },
},{timestamps:true});

mongoose.model("ServiceRequest",servicerquestSchema);