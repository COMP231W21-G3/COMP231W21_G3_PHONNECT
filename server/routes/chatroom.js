
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Chatroom = mongoose.model("Chatroom");
const User = mongoose.model("User");
const Chat = mongoose.model("Chat");

const openChatroomLive = (socket, io) => {
    socket.on("open chatroom", chatroomId => {
        Chatroom.findOne({ _id: chatroomId })
            .populate("participants", "_id username profPic")
            .then(chatroom => {
                Chat.find({ inChatRoom: chatroomId })
                    .populate("sender", "_id username profPic")
                    .then(chats => {
                        socket.leave(socket.room);
                        socket.join(chatroomId);
                        socket.emit("open chatroom success", { chatroom, chats });
                    })
                    .catch(err => {
                        console.log(err);
                    })
            })
            .catch(err => {
                console.log(err);
            })
    })
}

router.post('/changeHobbies',requireLogin,(req,res)=>{
    const {selectedHobbies}=req.body;

    User.findByIdAndUpdate(req.user._id,{
        hobbies:selectedHobbies
    },{
        new:true
    })
    .exec((err,user)=>{
        if(err){
            return res.status(422).json({ error: err });
        }
        else{
            res.json({hobbies:user.hobbies});
        }
    })
})

router.post('/findMatch',requireLogin,(req,res)=>{
    const {selectedHobbies}=req.body;

    User.aggregate([
        {
            $match: {
                hobbies: { $in: selectedHobbies },
                _id: { $ne: req.user._id }
            }
        },
        {
            $set: {
                matchedCount: {
                    $size: {
                        $setIntersection: ["$hobbies", selectedHobbies]
                    }
                }
            }
        },
        {
            $sort: {
                matchedCount: -1
            }
        }
    ], (err, matches) => {
        if (err) {
            return res.status(422).json({ error: err });
        }
        else {
            res.json({ matches });
        }
    });
})