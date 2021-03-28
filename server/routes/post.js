const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.post('/allposts', requireLogin, (req, res) => {
    let skip=parseInt(req.body.skip);
    let limit=parseInt(req.body.limit);

    Post.find() 
        .skip(skip)
        .limit(limit)
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .sort('-createdAt')
        .then(posts => {
            res.json({ 
                posts,
                postsSize:posts.length
            });
        })
        .catch(err => {
            console.log(err);
        })
});


router.post('/getsubposts', requireLogin, (req, res) => {
    let skip=parseInt(req.body.skip);
    let limit=parseInt(req.body.limit);

    Post.find({postedBy:{$in:[...req.user.following,req.user._id]}}) 
        .skip(skip)
        .limit(limit)
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .sort('-createdAt')
        .then(posts => {
            res.json({ 
                posts,
                postsSize:posts.length 
            });
        })
        .catch(err => {
            console.log(err);
        })
});

router.get('/post/:postId', requireLogin, (req, res) => {
    Post.findOne({_id:req.params.postId}) 
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

router.get('/myposts', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id username")
        .then(myposts => {
            res.json({ myposts })
        })
        .catch(err => {
            console.log(err);
        })
});

router.post('/createpost', requireLogin, (req, res) => {
    const { caption, photos } = req.body;
    if (!caption || photos.length === 0) {
        return res.status(422).json({ error: "Please add all field!" });
    }
    // console.log(req.user);
    // res.send("ok");
    req.user.email = undefined;
    req.user.password = undefined;
    const post = new Post({
        caption,
        photos,
        postedBy: req.user
    });
    post.save().then(result => {
        res.json({ post: result });
    })
        .catch(err => {
            console.log(err);
        })
});

module.exports = router;