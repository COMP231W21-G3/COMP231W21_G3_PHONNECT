import React, { useState, useEffect, useContext } from 'react';
import CarouselSlider from '../CarouselSlider';
import HomePostOptions from '../HomePostOptions';
import PreLoader from '../Preloader';
import { UserContext } from '../../App';
import M from 'materialize-css';
import CommentsModal from '../CommentsModal';
import LikesModal from '../LikesModal';
import { Link, useHistory, useParams } from 'react-router-dom';


const Post = () => {
    const history = useHistory();
    const [data, setData] = useState();
    const { state, dispatch } = useContext(UserContext);
    const { postId } = useParams();


    useEffect(() => {
        fetch(`/post/${postId}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                setData(result.post);
            })
    }, [])


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

    const likePost = (id) => {
        fetch('/like', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                let newData = null;
                if (data._id === result._id) {
                    newData = result;
                }
                else {
                    newData = data;
                }
                setData(newData);
                console.log(newData);
            }).catch(err => console.log(err))
    }

    const unlikePost = (id) => {
        fetch('/unlike', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                let newData = null;
                if (data._id === result._id) {
                    newData = result;
                }
                else {
                    newData = data;
                }
                setData(newData);
            }).catch(err => console.log(err))
    }

    const deletePost = (postId) => {
        fetch(`/deletepost/${postId}`, {
            method: "delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                history.push('/');
                M.toast({ html: "Deleted Post Successfully!", classes: "#43a047 green darken-1" });

    const deleteComment = (postId, commentId) => {

        fetch(`/deletecomment/${postId}/${commentId}`, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt")
            },
        })
            .then((res) => res.json())
            .then((result) => {
                console.log(result);
                let newData = null;
                if (data._id === result._id) {
                    newData = result;
                }
                else {
                    newData = data;
                }
                setData(newData);
            });
    };

    const followUser = (followId) => {
        fetch('/follow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                followId: followId
            })
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                dispatch({ type: "UPDATE", payload: { following: result.following, followers: result.followers } });
                localStorage.setItem("user", JSON.stringify(result));
            })
    }


    const unfollowUser = (followId) => {
        fetch('/unfollow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                unfollowId: followId
            })
        })
            .then(res => res.json())
            .then(result => {

                console.log(result);
                dispatch({ type: "UPDATE", payload: { following: result.following, followers: result.followers } });
                localStorage.setItem("user", JSON.stringify(result));
            })
    }

    return (
        <div className="home">

            {data ?


                <div className="card home-card" key={data._id}>
                    <div className="card-content">
                        <span className="card-title">
                            <Link to={data.postedBy._id == state._id ? "/profile" : `/profile/${data.postedBy.username}`}>
                                <img className="circle small-profPic" src={data.postedBy.profPic} />
                                {data.postedBy.username}</Link>
                            <i className="material-icons right activator" style={{ cursor: "pointer" }}>more_vert</i></span>

                        <p className="grey-text" style={{ paddingBottom: "13px", fontSize: "0.8em", textTransform: "uppercase" }}>{new Date(data.createdAt).toLocaleString()}</p>

                        <CarouselSlider item={data} />

                        {data.likes.find(record => record._id === state._id)
                            ? <i className="material-icons"
                                style={{ color: "red", cursor: "pointer" }}
                                onClick={() => { unlikePost(data._id) }}
                            >favorite</i>
                            : <i className="material-icons"
                                style={{ cursor: "pointer" }}
                                onClick={() => { likePost(data._id) }}
                            >favorite_border</i>
                        }

                        <LikesModal item={data} state={state} followUser={followUser} unfollowUser={unfollowUser} />

                        <p><span style={{ fontWeight: "500" }}>{data.postedBy.username}</span> {data.caption}</p>

                        {data.comments.length > 0
                            ?
                            <div><CommentsModal item={data} state={state} deleteComment={deleteComment} />
                                <p style={{ textOverflow: "ellipsis", overflow: "hidden" }}><span style={{ fontWeight: "500", paddingRight: "3px" }}>{data.comments[data.comments.length - 1].postedBy.username}</span>{data.comments[data.comments.length - 1].text}</p></div>
                            : null
                        }

                        <textarea type="text" placeholder="Add a comment" className={`cominput-${data._id} stylized-input`}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    makeComment(e.target.value, data._id);
                                }
                            }}
                        />


                    </div>
                    <div className="card-reveal">
                        <span className="card-title">Options<i className="material-icons right">close</i></span>

                    </div>
                </div>
                :
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader />
                </div>
            }

        </div>
    )
}

export default Post
