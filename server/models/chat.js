const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const chatSchema=new mongoose.Schema({
    message:{
        type:String
    },
    image:{
        type:String
    },
    sender:{
        type:ObjectId,
        ref:"User",
    },
    inChatRoom:{
        type:ObjectId,
        ref:"Chatroom",
        required:true
    }

},{timestamps:true});

mongoose.model("Chat",chatSchema);