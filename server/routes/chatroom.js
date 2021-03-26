
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