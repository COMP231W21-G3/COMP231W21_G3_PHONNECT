import React, { useState, useEffect, useContext } from 'react';
import CarouselSlider from '../CarouselSlider';
import PreLoader from '../Preloader';
import { UserContext } from '../../App';
import M from 'materialize-css';
import { Link } from 'react-router-dom';

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { state, dispatch } = useContext(UserContext);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(4);
    const [postsSize, setPostsSize] = useState(0);

    useEffect(() => {
        setLoading(true);
        getPosts({ skip, limit });
    }, [])

    const getPosts = (variables) => {
        fetch('/getsubposts', {
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

    const onLoadMore = () => {
        let newSkip = skip + limit;
        getPosts({ skip: newSkip, limit });
        setSkip(newSkip);
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

                                        <p><span style={{ fontWeight: "500" }}>{item.postedBy.username}</span> {item.caption}</p>
   

                                    </div>
                                    <div className="card-reveal">
                                        <span className="card-title">Options<i className="material-icons right">close</i></span>                                      
                                    </div>
                                </div>
                            )
                        })}
                        {postsSize >= limit &&
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

export default Home