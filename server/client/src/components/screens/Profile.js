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

        return (
        <div style={{ maxWidth: "600px", margin: "0px auto" }}>

            {profilePosts && state ?
                <>
                    <div className="row" style={{ margin: "15px auto" }}>
                        <div className="col s3">
                           
                                <img className="upload-profPic"
                                    src={state ? state.profPic : "Loading..."} />
                            
                        </div>

                        <div className="col s9"
                            style={{ display: "flex", justifyContent: "center" }}>
                            <h4 className="styled-title" style={{ fontSize: "2em" }}>
                                {state ? state.username : "Loading..."}</h4>
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