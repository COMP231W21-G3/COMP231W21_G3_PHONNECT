const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const requireLogin = require('../middleware/requireLogin');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const {SENDGRID_API,EMAIL}=require('../config/keys');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: SENDGRID_API
    }
}));

router.get('/protected', requireLogin, (req, res) => { //to get protected, have to pass through requireLogin first
    res.send("hello user");
});

router.post('/signup', (req, res) => {
    const { username, email, password, profPic } = req.body;
    if (!email || !password || !username) {
        return res.status(422).json({ error: "Please add all the fields" });
    }
    User.findOne({ email: email })
        .then(
            (savedUser) => {
                if (savedUser) {
                    return res.status(422).json({ error: "Email already existed" });
                }
                User.findOne({ username: username })
                    .then(
                        (savedUser) => {
                            if (savedUser) {
                                return res.status(422).json({ error: "Username already existed" });
                            }
                            bcrypt.hash(password, 12) //12 is level of security. default is 10
                                .then(hashedPassword => {
                                    const user = new User({
                                        email,
                                        username,
                                        password: hashedPassword,
                                        profPic
                                    })
                                    user.save()
                                        .then(user => {
                                            transporter.sendMail({
                                                to: user.email,
                                                from: "phongstagramherokuapp@gmail.com",
                                                subject: "Signup Success!",
                                                html: "<h1>Welcome to Phongstagram!</h1> <img style='width:300px;' src='cid:unique@kreata.ee'/>",
                                                attachments: [{
                                                    filename: 'phongstagram_thumbnail.png',
                                                    path: 'https://res.cloudinary.com/phongcloudinary/image/upload/v1602559179/phongstagram_thumb_qqiduz.png',
                                                    cid: 'unique@kreata.ee' //same cid value as in the html img src
                                                }]
                                            })

                                            res.json({ message: "Saved successfully" });
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                        })
                    .catch(err => {
                        console.log(err);
                    })
            }).catch(err => {
                console.log(err);
            })
});

router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({ error: "Please add email and password" });
    }
    User.findOne({ email: email })
        .populate("followers", "_id username profPic")
        .populate("following", "_id username profPic")
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid email or password" });
            }
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        //res.json({ message: "Successfully signed in" });
                        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET); //generate token based on user id
                        const { _id, username, email, followers, profPic, following, hobbies } = savedUser;
                        res.json({ token, user: { _id, username, email, profPic, followers, following, hobbies } });
                    }
                    else {
                        return res.status(422).json({ error: "Invalid email or password" });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        })
});

module.exports = router;