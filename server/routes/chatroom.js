const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Chatroom = mongoose.model("Chatroom");
const User = mongoose.model("User");
const Chat = mongoose.model("Chat");

<<<<<<< Updated upstream
=======
const createChatroomLive = (socket, io) => {
    socket.on("create chatroom", participants => {
        if (!participants || participants.length <= 1) {
            const error = "Select another participant!";
            //send only to current socket
            return socket.emit("create chatroom failed", error);
        }

        const chatroom = new Chatroom({
            participants
        })
        chatroom.save()
            .then(savedChatroom => {
                Chatroom.findById(savedChatroom._id)
                    .populate("participants", "_id username profPic")
                    .then(chatroom => {
                        //send to all sockets
                        io.emit("create chatroom success",
                            chatroom
                        );
                    })
            })
            .catch(err => {
                console.log(err);
            })
    })
}

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
}
=======

module.exports = router;
module.exports.createChatroomLive = createChatroomLive;
module.exports.openChatroomLive = openChatroomLive;
module.exports.addChatLive = addChatLive;
module.exports.addParticipantsLive = addParticipantsLive;
module.exports.removeParticipantLive = removeParticipantLive;
module.exports.openVideoChatRoomLive = openVideoChatRoomLive;
module.exports.closeVideoChatRoomLive = closeVideoChatRoomLive;
>>>>>>> Stashed changes
