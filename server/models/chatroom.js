const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const chatroomSchema=new mongoose.Schema({
    participants:[{type:ObjectId,ref:"User"}],
    lastSeenBy:[{type:ObjectId,ref:"User"}]
});

mongoose.model("Chatroom",chatroomSchema);

