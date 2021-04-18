const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");
const User = mongoose.model("User");
const Chatroom = mongoose.model("Chatroom");
const ServiceRequest = mongoose.model("ServiceRequest");
const {ObjectId}=mongoose.Types.ObjectId;

router.get('/allpostsTest', (req, res) => {
    Post.find() 
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .sort('-createdAt')
        .then(posts => {
            res.json({ 
                posts
            });
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/postTest', (req, res) => {
    Post.findOne({_id:ObjectId("6078732720ddfc3424e26372")}) 
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .then(post => {
            res.json({ post });
        })
        .catch(err => {
            console.log(err);
        })
});


router.get('/profileTest', (req, res) => {
    User.findOne({ username: "phongvu" })
        .select("-password -email")
        .populate("followers", "_id username profPic")
        .populate("following", "_id username profPic")
        .then(user => {
            Post.find({ postedBy: user._id })
                .populate("likes", "_id username")
                .populate("comments.postedBy", "_id username")
                .populate("postedBy", "_id username")
                .exec((err, posts) => {
                    if (err) {
                        return res.this.status(422).json({ error: err });
                    }
                    res.json({ user, posts });
                })
        })
})

router.get('/chatroomsTest', (req, res) => {
    Chatroom.find({ participants: ObjectId("6078758220ddfc3424e26374") })
        .populate("participants", "_id username profPic")
        .then(chatrooms => {
            res.json({
                chatrooms
            });
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/servicerequestTest',(req,res)=>{
    ServiceRequest.findOne({_id:ObjectId("607887a66b5b7c39e4d611ad")})
        .then(servicerequest=>{
            res.json({
                servicerequest
            })
        })
        .catch(err => {
            console.log(err);
        })
})

module.exports = router;