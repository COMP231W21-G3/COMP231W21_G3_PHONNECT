const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Chatroom = mongoose.model("Chatroom");
const User = mongoose.model("User");
const Chat = mongoose.model("Chat");

router.get('/chatrooms', requireLogin, (req, res) => {
    Chatroom.find({ participants: req.user._id })
        .populate("participants", "_id username profPic")
        .then(chatrooms => {
            res.json({
                chatrooms,
                currentUser: {
                    _id: req.user._id,
                    username: req.user.username,
                    profPic: req.user.profPic
                }
            });
        })
        .catch(err => {
            console.log(err);
        })
});

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

const openChatroomLive = (socket, io) => {
    socket.on("open chatroom", data => {
        const {chatroomId,currentUserId}=data;
        Chatroom.findOneAndUpdate({ _id: chatroomId },{
            $addToSet: { lastSeenBy:currentUserId}
        }, {
            new: true
        })
            .populate("participants", "_id username profPic")
            .exec((err,chatroom) => {
                if(err){
                    console.log(err);
                }
                else{
                    Chat.find({ inChatRoom: chatroomId })
                    .populate("sender", "_id username profPic")
                    .then(chats => {
                        socket.leaveAll();
                        socket.join(chatroomId);
                        socket.emit("open chatroom success", { chatroom, chats });
                    })
                    .catch(err => {
                        console.log(err);
                    })
                }
            })
    })
}

const addChatLive = (socket, io) => {
    socket.on("add chat", data => {
        const { message, image, sender, inChatRoom } = data;

        // console.log(io.sockets.adapter.rooms.get(inChatRoom._id));
        // console.log(io.sockets.adapter.rooms.get(inChatRoom._id).has(socket.id));

        const chat = new Chat({
            message,
            image,
            sender,
            inChatRoom
        })
        chat.save()
            .then(savedChat => {
                Chat.findById(savedChat._id)
                    .populate("sender", "_id username profPic")
                    .then(chat => {
                        Chatroom.findByIdAndUpdate(inChatRoom._id,{
                              lastSeenBy: [sender] 
                        }, {
                            new: true
                        })
                        .exec((err, result) => {
                            if (err) {
                                
                            }
                            else {
                                io.sockets.in(inChatRoom._id).emit("add chat success",
                                    chat
                                );
                            }
                        })
                    })
            })
            .catch(err => {
                console.log(err);
            })
    })
}

router.post('/search-participants', requireLogin, (req, res) => {
    let userPattern = new RegExp("^" + req.body.query);
    if (req.body.query !== "") {
        User.find({ username: { $regex: userPattern }, _id: { $ne: req.user._id } })
            .select("_id username profPic")
            .then(searched_partis => {
                res.json({ searched_partis })
            })
            .catch(err => {
                console.log(err);
            })
    }
    else {
        res.json({ searched_partis: [] });
    }
})

router.post('/search-add-participants', requireLogin, (req, res) => {
    let userPattern = new RegExp("^" + req.body.query);

    Chatroom.findOne({_id:req.body.chatroom})
        .then(
            (savedChatroom) => {
                console.log(savedChatroom)
                if (savedChatroom) {
                    if (req.body.query !== "") {
                        User.find({ username: { $regex: userPattern }, _id: { $nin: savedChatroom.participants } })
                            .select("_id username profPic")
                            .then(searched_partis => {
                                res.json({ searched_partis })
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    }
                    else {
                        res.json({ searched_partis: [] });
                    }
                }
            }
        )
        .catch(err => {
            console.log(err);
        })
})

const addParticipantsLive = (socket, io) => {
    socket.on("add participants", data => {
        const { chatroom, partisToAdd } = data;

        if (!partisToAdd || partisToAdd.length <= 0) {
            const error = "Select another participant!";
            return socket.emit("add participants failed", error);
        }

        Chatroom.findOneAndUpdate({_id:chatroom._id}, {
            $addToSet: { participants: partisToAdd }
        }, {
            new: true
        })
            .populate("participants", "_id username profPic")
            .exec((err, result) => {
                if (err) {
                    return socket.emit("add participants failed", error);
                }
                else {
                    const chat = new Chat({
                        message: `${data.currentUser.username} added ${partisToAdd.map(parti => parti.username + "")}`,
                        inChatRoom: result
                    })

                    chat.save()
                        .then(chat => {
                            io.emit("add participants success", result);

                            io.sockets.in(chatroom._id).emit("add chat success",
                                chat
                            );
                        })

                        .catch(err => {
                            console.log(err);
                        })
                }
            })
    })
}

const removeParticipantLive = (socket, io) => {
    socket.on("remove participant", data => {
        const { user, chatroom } = data;

        Chatroom.findOneAndUpdate({_id:chatroom._id}, {
            $pull: { participants: user._id }
        }, {
            new: true
        })
            .populate("participants", "_id username profPic")
            .exec(async (err, result) => {
                if (err) {
                    return res.status(422).json({ error: err });
                }
                else {
                    if (result.participants.length <= 0) {
                        socket.leave(socket.room);
                        io.emit("remove participant success", result);
                        await Chat.deleteMany({ inChatRoom: chatroom._id })
                            .then(async deletedChats => {
                                await Chatroom.deleteOne({ _id: chatroom._id })
                                    .then(deletedChatroom => {

                                    }).catch(err => {
                                        console.log(err);
                                    })
                            }).catch(err => {
                                console.log(err);
                            })
                    }
                    else {
                        const chat = new Chat({
                            message: `${data.currentUser.username} removed ${user.username}`,
                            inChatRoom: result
                        })

                        chat.save()
                            .then(chat => {
                                io.emit("remove participant success", result);

                                io.sockets.in(chatroom._id).emit("add chat success",
                                    chat
                                );
                            })

                            .catch(err => {
                                console.log(err);
                            })
                    }
                }
            })
    })
}

const openVideoChatRoomLive = (socket, io) => {
    socket.on("open videochat room", data => {
        const { chatroom, currentUser } = data;
        Chatroom.findOne({_id:chatroom._id})
            .then(savedChatroom => {
                const chat = new Chat({
                    message: `${currentUser.username} joined video call`,
                    inChatRoom: savedChatroom
                })

                chat.save()
                    .then(chat => {
                        io.sockets.in(chatroom._id).emit("add chat success",
                            chat
                        );
                    })
                    .catch(err => {
                        console.log(err);
                    })
            })
    })
}


const closeVideoChatRoomLive = (socket, io) => {
    socket.on("close videochat room", data => {
        const { chatroom, currentUser } = data;
        Chatroom.findOne({_id:chatroom._id})
            .then(savedChatroom => {
                const chat = new Chat({
                    message: `${currentUser.username} left video call`,
                    inChatRoom: savedChatroom
                })

                chat.save()
                    .then(chat => {
                        io.sockets.in(chatroom._id).emit("add chat success",
                            chat
                        );
                    })
                    .catch(err => {
                        console.log(err);
                    })
            })
    })
}

router.get('/videochatroom/:roomId',requireLogin,(req,res)=>{
    Chatroom.findOne({_id:req.params.roomId})
    .then(
        chatroom=>
        {
            if(chatroom.participants.includes(req.user._id)){
                res.json({chatroom});
            }
            else{
                return res.status(422).json({ error: "Cannot find this room" });
            }
        }
    )
})

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

module.exports = router;
module.exports.createChatroomLive = createChatroomLive;
module.exports.openChatroomLive = openChatroomLive;
module.exports.addChatLive = addChatLive;
module.exports.addParticipantsLive = addParticipantsLive;
module.exports.removeParticipantLive = removeParticipantLive;
module.exports.openVideoChatRoomLive = openVideoChatRoomLive;
module.exports.closeVideoChatRoomLive = closeVideoChatRoomLive;

