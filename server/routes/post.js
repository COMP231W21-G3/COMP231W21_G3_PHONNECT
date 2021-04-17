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

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    })
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err });
            }
            else {
                res.json(result);
            }
        })
})

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    })
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err });
            }
            else {
                res.json(result);
            }
        })
})

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err });
            }
            else {
                res.json(result);
            }
        })
})

router.put('/editpost/:postId', requireLogin, (req, res) => {
    const { caption, photos } = req.body;
    if (!caption || photos.length === 0) {
        return res.status(422).json({ error: "Please add all field!" });
    }

    Post.findByIdAndUpdate(req.params.postId, {
        caption,
        photos
    }, {
        new: true
    })
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err });
            }
            else {
                res.json(result);
            }
        })
})

router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err });
            }
            if (post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json(result)
                    }).catch(err => {
                        console.log(err);
                    })
            }
        })
})

router.put("/deletecomment/:postId/:commentId", requireLogin, (req, res) => {
    const comment = { _id: req.params.commentId };
    Post.findByIdAndUpdate(
        req.params.postId,{
            $pull: { comments: comment }
        },
        {
            new: true,
        }
    )
        .populate("likes", "_id username profPic")
        .populate("comments.postedBy", "_id username profPic")
        .populate("postedBy", "_id username profPic")
        .exec((err, result) => {
            if (err || !result) {
                return res.status(422).json({ error: err });
            } else {
                res.json(result);
            }
        });
});

module.exports = router;