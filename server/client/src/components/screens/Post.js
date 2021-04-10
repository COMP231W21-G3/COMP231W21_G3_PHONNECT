import React, { useState, useEffect, useContext } from 'react';
import CarouselSlider from '../CarouselSlider';
import HomePostOptions from '../HomePostOptions';
import PreLoader from '../Preloader';
import { UserContext } from '../../App';
import M from 'materialize-css';
import CommentsModal from '../CommentsModal';
import LikesModal from '../LikesModal';
import { Link, useHistory, useParams } from 'react-router-dom';

const makeComment = (text, postId) => {
    fetch('/comment', {
        method: "put",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({
            postId,
            text
        })
    })
        .then(res => res.json())
        .then(result => {
            console.log(result);
            let newData = null;
            if (data._id === result._id) {
                newData = result;
            }
            else {
                newData = data;
            }
            setData(newData);

            var commentinput = document.getElementsByClassName(`cominput-${postId}`)[0]
            commentinput.value = "";
            commentinput.blur();

        }).catch(err => {
            console.log(err);
        })
}