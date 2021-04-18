import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../App';
import { Link, useHistory } from 'react-router-dom';
import PreLoader from '../Preloader';
import M from "materialize-css";

const Profile = () => {
    const history = useHistory();
    const [profilePosts, setProfilePosts] = useState();
    const { state, dispatch } = useContext(UserContext);
    const [image, setImage] = useState("");

    useEffect(() => {
        var elems = document.querySelectorAll('.modal');
        M.Modal.init(elems, {});
    }, [])

    useEffect(() => {
        fetch('/myposts', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                setProfilePosts(result.myposts);
            })
    }, [])

    const updateProfPic = () => {
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "phongstagram");
            data.append("cloud_name", "phongcloudinary");

            fetch("https://api.cloudinary.com/v1_1/phongcloudinary/image/upload", { 
                method: "post",
                body: data
            })
                .then(res => res.json())
                .then(data => {
                    fetch('/updateprofpic', {
                        method: "put",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + localStorage.getItem("jwt")
                        },
                        body: JSON.stringify({
                            profPic: data.url
                        })
                    })
                        .then(res => res.json())
                        .then(result => {
                            console.log(result);
                            localStorage.setItem("user", JSON.stringify({ ...state, profPic: result.profPic }));
                            dispatch({ type: "UPDATEPROFPIC", payload: result.profPic });
                        }).then(() => {
                            var elem = document.querySelector("#updateProfPicModal");
                            M.Modal.init(elem);
                            elem.M_Modal.close();
                        })
                }).catch(err => {
                    console.log(err);
                })
        }
        else {
            M.toast({ html: "Please select an image!", classes: "#c62828 red darken-1" });
        }
    }

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
        <div style={{ maxWidth: "600px", margin: "0px auto" }}>

            <div id="followersModal" className="modal modal-fixed-footer small-modal">
                <div className="modal-content">
                    <h4 className="styled-title">Followers</h4>

                    <ul className="collection">
                        {state && state.followers.length > 0 ?
                            state.followers.map((item) => {
                                return <li key={item._id} className="collection-item avatar">
                                    <Link to={item._id == state._id ? "/profile" : `/profile/${item.username}`}>
                                        <img src={item.profPic} alt="" className="circle" />
                                        <h6 style={{ fontWeight: "500" }} className="title">{item.username}</h6>
                                    </Link>

                                    {
                                        state._id === item._id ?
                                            null :
                                            !state.following || (state.following && !state.following.some(user => user._id === item._id)) ?
                                                <button className="secondary-content btn-small waves-effect waves-light #1976d2 blue darken-1"
                                                    onClick={() => followUser(item._id)}>
                                                    Follow</button>
                                                :
                                                <button className="secondary-content btn-small waves-effect waves-light #ef5350 red lighten-1"
                                                    onClick={() => unfollowUser(item._id)}>
                                                    Unfollow</button>
                                    }
                                </li>

                            })
                            : null}
                    </ul>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-close btn-flat">Close</a>
                </div>
            </div>

            <div id="followingModal" className="modal modal-fixed-footer small-modal">
                <div className="modal-content">
                    <h4 className="styled-title">Following</h4>

                    <ul className="collection">
                        {state && state.following.length > 0 ?
                            state.following.map((item) => {
                                return <li key={item._id} className="collection-item avatar">
                                    <Link to={item._id == state._id ? "/profile" : `/profile/${item.username}`}>
                                        <img src={item.profPic} alt="" className="circle" />
                                        <h6 style={{ fontWeight: "500" }} className="title">{item.username}</h6>
                                    </Link>

                                    {
                                        state._id === item._id ?
                                            null :
                                            !state.following || (state.following && !state.following.some(user => user._id === item._id)) ?
                                                <button className="secondary-content btn-small waves-effect waves-light #1976d2 blue darken-1"
                                                    onClick={() => followUser(item._id)}>
                                                    Follow</button>
                                                :
                                                <button className="secondary-content btn-small waves-effect waves-light #ef5350 red lighten-1"
                                                    onClick={() => unfollowUser(item._id)}>
                                                    Unfollow</button>
                                    }
                                </li>
                            })
                            : null}
                    </ul>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-close btn-flat">Close</a>
                </div>
            </div>

            {/* update prof pic modal */}
            <div id="updateProfPicModal" className="modal modal-fixed-footer small-modal">
                {state ?
                    <>

                        <div className="modal-content">
                            <h4 className='styled-title'>Update Profile Pic</h4>

                            <div style={{ display: "flex", justifyContent: "center" }}>
                                {
                                    !image ? <img className="upload-profPic"
                                        src={state.profPic} />
                                        :
                                        <img className="upload-profPic"
                                            src={image ? URL.createObjectURL(image) : null}></img>
                                }
                            </div>

                            <div className="file-field input-field">
                                <div className="btn waves-effect waves-light #1976d2 blue darken-1">
                                    <span>Upload Pic</span>
                                    <input type="file" accept="image/*"
                                        onChange={(e) => setImage(e.target.files[0])} />
                                </div>
                                <div className="file-path-wrapper">
                                    <input className="file-path validate" type="text" placeholder="No Image" disabled />
                                </div>

                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                                        onClick={() => updateProfPic()}>
                                        Update Profile Pic</button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <a href="#!" className="modal-close btn-flat">Close</a>
                        </div>
                    </>

                    : "Loading..."}
            </div>

            {profilePosts && state ?
                <>
                    <div className="row" style={{ margin: "15px auto" }}>
                        <div className="col s3">
                            <a className="modal-trigger" href="#updateProfPicModal">
                                <img className="upload-profPic"
                                    src={state ? state.profPic : "Loading..."} />
                            </a>
                        </div>

                        <div className="col s9"
                            style={{ display: "flex", justifyContent: "center" }}>
                            <h4 className="styled-title" style={{ fontSize: "2em" }}>
                                {state ? state.username : "Loading..."}</h4>
                        </div>
                    </div>

                    <div className="row" style={{ border: "solid lightgrey", borderWidth: "1px 0px", padding: "20px" }}>
                        <div className="col s4" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "500" }}>{profilePosts.length}</span> posts
                        </div>

                        <div className="col s4" style={{ textAlign: "center" }}>
                            <a className="modal-trigger" href="#followersModal">
                                <span style={{ fontWeight: "500" }}>{state.followers ? state.followers.length : "0"}</span> followers
                            </a>
                        </div>

                        <div className="col s4" style={{ textAlign: "center" }}>
                            <a className="modal-trigger" href="#followingModal">
                                <span style={{ fontWeight: "500" }}>{state.following ? state.following.length : "0"}</span> following
                            </a>
                        </div>
                    </div>

                    {
                        profilePosts.length > 0 ?
                            <div className="gallery">
                                {profilePosts.map((item) => {
                                    return (
                                        <div className="gallery-item" key={item._id}>
                                            <Link to={`/post/${item._id}`}>
                                                {
                                                    item.photos[0].substring(item.photos[0].lastIndexOf('.') + 1, item.photos[0].length).match(/(jpg|jpeg|png|gif)$/i) ?
                                                        <img src={item.photos[0]} />
                                                        : <video onTouchEnd={() => history.push(`/post/${item._id}`)}
                                                            style={{ backgroundColor: "black" }} width="200" height="200" src={`${item.photos[0]}#t=0.1`} preload="metadata" />
                                                }


                                                {
                                                    item.photos.length > 1 &&
                                                    <div className="gallery-ind">
                                                        <i className="material-icons">collections</i>
                                                    </div>
                                                }
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                            : <h5 style={{ display: "flex", justifyContent: "center", color: "gray", margin: "50px" }}>No posts on profile!</h5>}
                </>
                :
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader />
                </div>}
        </div>
    )
}

export default Profile