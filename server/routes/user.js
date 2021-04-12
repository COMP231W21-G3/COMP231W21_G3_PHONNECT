const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get('/profile/:username', requireLogin, (req, res) => {
    User.findOne({ username: req.params.username })
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

router.put('/follow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(422).json({ error: err });
        }
        User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, {
            new: true
        }).select("-password -email")
            .populate('followers', '_id username profPic')
            .populate('following', '_id username profPic')
            .then(result => {
                res.json(result);
            }).catch(err => {
                return res.status(422).json({ error: err });
            })
    })
})

router.put('/unfollow', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(422).json({ error: err });
        }
        User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowId }
        }, {
            new: true
        }).select("-password -email")
            .populate('followers', '_id username profPic')
            .populate('following', '_id username profPic')
            .then(result => {
                res.json(result);
            }).catch(err => {
                return res.status(422).json({ error: err });
            })
    })
})

//route to update profile pic 
router.put('/updateprofpic', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id,
        { $set: { profPic: req.body.profPic } },
        { new: true },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: "Cannot update profile pic!" })
            }
            res.json(result);
        })
})
router.post('/search-users', requireLogin, (req, res) => {
    let userPattern = new RegExp("^" + req.body.query);
    if (req.body.query !== "") {
        User.find({ username: { $regex: userPattern } })
            .select("_id username profPic")
            .then(users => {
                res.json({ users })
            })
            .catch(err => {
                console.log(err);
            })
    }
    else{
        res.json({users:[]});
    }
})

module.exports = router;