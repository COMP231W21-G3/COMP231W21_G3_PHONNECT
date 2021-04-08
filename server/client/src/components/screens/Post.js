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