import React, { useState, useEffect, useContext } from 'react';
import CarouselSlider from '../CarouselSlider';
import HomePostOptions from '../HomePostOptions';
import PreLoader from '../Preloader';
import { UserContext } from '../../App';
import M from 'materialize-css';
import CommentsModal from '../CommentsModal';
import LikesModal from '../LikesModal';
import { Link } from 'react-router-dom';

const AllPosts = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { state, dispatch } = useContext(UserContext);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(4);
    const [postsSize,setPostsSize]=useState(0);
    const [likedPostLoading,setLikedPostLoading]=useState(null);

    useEffect(() => {
        setLoading(true);
        getPosts({ skip, limit });
    }, [])

    const getPosts = (variables) => {
        fetch('/allposts', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                skip: variables.skip,
                limit: variables.limit
            })
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                setLoading(false);
                setData([...data, ...result.posts]);
                setPostsSize(result.postsSize);
            })
    }

    const onLoadMore = () => {
        let newSkip = skip + limit;
        getPosts({ skip: newSkip, limit });
        setSkip(newSkip);
    }

    const likePost = (id) => {
        setLikedPostLoading(id);
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
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        return result;
                    }
                    else {
                        return item;
                    }
                })
                setData(newData);
                setLikedPostLoading(null);
                console.log(newData);
            }).catch(err => console.log(err))
    }

    const unlikePost = (id) => {
        setLikedPostLoading(id);
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
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        return result;
                    }
                    else {
                        return item;
                    }
                })
                setData(newData);
                setLikedPostLoading(null);
            }).catch(err => console.log(err))
    }

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
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        return result;
                    }
                    else {
                        return item;
                    }
                })
                setData(newData);

                var commentinput = document.getElementsByClassName(`cominput-${postId}`)[0]
                commentinput.value = "";
                commentinput.blur();
            })
            .catch(err => {
                console.log(err);
            })
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
                const newData = data.filter(item => {
                    return item._id !== result._id;
                })
                setData(newData);
                M.toast({ html: "Deleted Post Successfully!", classes: "#43a047 green darken-1" });
            })
    }

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
                const newData = data.map((item) => {
                    if (item._id == result._id) {
                        return result;
                    }
                    else {
                        return item;
                    }
                });
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

            {loading ?
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader />
                </div>
                :
                data.length > 0 ?
                    <>
                        {data.map(item => {
                            return (
                                <div className="card home-card" key={item._id}>
                                    <div className="card-content">
                                        <span className="card-title">
                                            <Link to={item.postedBy._id == state._id ? "/profile" : `/profile/${item.postedBy.username}`}>
                                                <img className="small-profPic" src={item.postedBy.profPic} />
                                                {item.postedBy.username}</Link>
                                            <i className="material-icons right activator" style={{ cursor: "pointer" }}>more_vert</i></span>

                                        <p className="grey-text" style={{ paddingBottom: "13px", fontSize: "0.8em" }}>{new Date(item.createdAt).toLocaleString()}</p>

                                        <CarouselSlider item={item} />

                                        {
                                        likedPostLoading===item._id ?
                                        <div className="preloader-wrapper small active" style={{width:"24px",height:"24px"}}>
                                            <div className="spinner-layer spinner-blue-only">
                                                <div className="circle-clipper left">
                                                    <div className="circle"></div>
                                                </div><div className="gap-patch">
                                                    <div className="circle"></div>
                                                </div><div className="circle-clipper right">
                                                    <div className="circle"></div>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        item.likes.find(record => record._id === state._id)
                                            ? <i className="material-icons"
                                                style={{ color: "red", cursor: "pointer" }}
                                                onClick={() => { unlikePost(item._id) }}
                                            >favorite</i>
                                            : <i className="material-icons"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => { likePost(item._id) }}
                                            >favorite_border</i>
                                        }

                                        <LikesModal item={item} state={state} followUser={followUser} unfollowUser={unfollowUser} />

                                        <p><span style={{ fontWeight: "500" }}>{item.postedBy.username}</span> {item.caption}</p>

                                        {item.comments.length > 0
                                            ?
                                            <div><CommentsModal item={item} state={state} deleteComment={deleteComment} />
                                                <p style={{ textOverflow: "ellipsis", overflow: "hidden" }}><span style={{ fontWeight: "500", paddingRight: "3px" }}>{item.comments[item.comments.length - 1].postedBy.username}</span>{item.comments[item.comments.length - 1].text}</p></div>
                                            : null
                                        }

                                        <textarea type="text" placeholder="Add a comment" className={`cominput-${item._id} stylized-input`}
                                            onKeyDown={e => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    makeComment(e.target.value, item._id);
                                                }
                                            }}
                                        />

                                    </div>
                                    <div className="card-reveal">
                                        <span className="card-title">Options<i className="material-icons right">close</i></span>
                                        <HomePostOptions item={item} state={state} deletePost={deletePost} followUser={followUser} unfollowUser={unfollowUser} />
                                    </div>
                                </div>
                            )
                        })}
                        {postsSize>=limit&&
                        <div style={{ margin: "30px auto", width: "fit-content" }}>
                            <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                                onClick={() => onLoadMore()}>
                                Load More
                            </button>
                        </div>}
                    </>
                    : <h5 style={{ display: "flex", justifyContent: "center", color: "gray", margin: "50px" }}>No posts on your feed!</h5>
            }
        </div>
    )
}

export default AllPosts