import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import PreLoader from '../Preloader';
import { useParams, useHistory, Link } from 'react-router-dom';
import M from "materialize-css";

const UserProfile = () => {
    const history = useHistory();
    const [userProfile, setProfile] = useState(null);
    const { state, dispatch } = useContext(UserContext);
    const { username } = useParams();
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        var elems = document.querySelectorAll('.modal');
        M.Modal.init(elems, {});

    }, [])

    const fetchUserProfile = () => {
        fetch(`/profile/${username}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                setProfile(result);
            })
    }

    useEffect(() => {
        if (state && state.username === username) {
            history.push('/profile');
        }
        else if (state && state.username !== username) {
            fetchUserProfile();
        }
    }, [state])

    useEffect(() => {
        fetchUserProfile();
    }, [username])

    const followUser = () => {
        setFollowLoading(true);
        fetch('/follow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                followId: userProfile.user._id
            })
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                dispatch({ type: "UPDATE", payload: { following: result.following, followers: result.followers } });
                localStorage.setItem("user", JSON.stringify(result));
                setProfile(prevState => {
                    return {
                        ...prevState,
                        user: {
                            ...prevState.user,
                            followers: [...prevState.user.followers, result._id]
                        }
                    }
                })
                setFollowLoading(false);
            })
    }

    const unfollowUser = () => {
        setFollowLoading(true);
        fetch('/unfollow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                unfollowId: userProfile.user._id
            })
        })
            .then(res => res.json())
            .then(result => {

                console.log(result);
                dispatch({ type: "UPDATE", payload: { following: result.following, followers: result.followers } });
                localStorage.setItem("user", JSON.stringify(result));
                setProfile(prevState => {
                    const newFollowers = prevState.user.followers.filter(item => item._id !== result._id);
                    return {
                        ...prevState,
                        user: {
                            ...prevState.user,
                            followers: newFollowers
                        }
                    }
                })
                setFollowLoading(false);
            })
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0px auto" }}>

            {userProfile && state
                ?
                <>
                    <div className="row" style={{ margin: "15px auto" }}>
                        <div className="col s3">
                            <img style={{ width: "160px", height: "160px", borderRadius: "80px" }}
                                src={userProfile.user.profPic} />
                        </div>

                        <div className="col s9"
                            style={{ display: "flex", justifyContent: "center" }}>
                            <h4 className="styled-title col-s9" style={{ fontSize: "2em" }}>
                                {userProfile.user.username}</h4>
                        </div>

                        <div className="col s9"
                            style={{ display: "flex", justifyContent: "center", margin: "10px auto" }}>
                            {
                                followLoading ?
                                    <div className="preloader-wrapper small active">
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
                                    !state.following || (state.following && !state.following.some(user => user._id === userProfile.user._id)) ?
                                        <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                                            onClick={() => followUser()}>
                                            Follow</button>
                                        :
                                        <button className="btn waves-effect waves-light #ef5350 red lighten-1"
                                            onClick={() => unfollowUser()}>
                                            Unfollow</button>
                            }
                        </div>

                    </div>

                    {userProfile.posts.length > 0 ?
                        <div className="gallery">
                            {userProfile.posts.map((item) => {
                                return (
                                    <div className="gallery-item" key={item._id}>
                                        <Link to={`/post/${item._id}`}>
                                            {
                                                item.photos[0].substring(item.photos[0].lastIndexOf('.') + 1, item.photos[0].length).match(/(jpg|jpeg|png|gif)$/i) ?
                                                    <img src={item.photos[0]} />
                                                    : <video onTouchEnd={() => history.push(`/post/${item._id}`)}
                                                        style={{ backgroundColor: "black" }} src={`${item.photos[0]}#t=0.1`} preload="metadata" />
                                            }
                                        </Link>

                                        {
                                            item.photos.length > 1 &&
                                            <div className="gallery-ind">
                                                <i className="material-icons">collections</i>
                                            </div>
                                        }
                                    </div>
                                )
                            })}
                        </div>
                        : <h5 style={{ display: "flex", justifyContent: "center", color: "gray", margin: "50px" }}>No posts on profile!</h5>}
                </>
                :
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader></PreLoader>
                </div>}
        </div>
    )
}

export default UserProfile