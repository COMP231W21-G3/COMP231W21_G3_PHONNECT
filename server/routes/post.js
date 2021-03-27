const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");

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
