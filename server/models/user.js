const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const userSChema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },

    resetToken:String,
    expireToken:Date,

    profPic:{
        type:String,
        default:"https://res.cloudinary.com/phongcloudinary/image/upload/v1601519288/profile_jbknw2.png"
    },

    followers:[{type:ObjectId,ref:"User"}],

    following:[{type:ObjectId,ref:"User"}]
});

mongoose.model("User",userSChema);