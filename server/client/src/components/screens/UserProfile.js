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

                    </div>

                    <div className="row" style={{ border: "solid lightgrey", borderWidth: "1px 0px", padding: "20px" }}>
                        <div className="col s4" style={{ textAlign: "center" }}>
                            <span style={{ fontWeight: "500" }}>{userProfile.posts.length}</span> posts
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