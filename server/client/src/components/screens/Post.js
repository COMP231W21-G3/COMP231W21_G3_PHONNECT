import React, { useState, useEffect, useContext } from 'react';
import CarouselSlider from '../CarouselSlider';
import PreLoader from '../Preloader';
import { UserContext } from '../../App';
import M from 'materialize-css';
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