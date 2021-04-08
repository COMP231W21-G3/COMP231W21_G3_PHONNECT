import React, { useEffect } from "react";
import M from "materialize-css";
import { Link } from 'react-router-dom';

const LikesModal = ({ item, state,followUser,unfollowUser }) => {
    useEffect(() => {
        var elems = document.querySelectorAll('.modal');
        M.Modal.init(elems, {});
    }, [])

    return (
        <div>
            <a className="modal-trigger grey-text" href={`#likes-${item._id}`}>{item.likes.length} likes</a>

            <div id={`likes-${item._id}`} className="modal modal-fixed-footer small-modal">
                <div className="modal-content">
                    <h4 className="card-title">Likes</h4>

                    {
                        item.likes.length > 0
                            ? (<ul className="collection">
                                {
                                    item.likes.map((record) => {
                                        return (

                                            <li key={record._id} className="collection-item avatar">       
                                                                               
                                                    <Link to={record._id == state._id ? "/profile" : `/profile/${record.username}`}>
                                                        <img src={record.profPic} alt="" className="circle" style={{objectFit:"cover"}} />
                                                        <h6 style={{ fontWeight: "500" }} className="title">  {record.username}</h6></Link>

                                                {
                                                    state._id===record._id?
                                                    null:
                                                    !state.following || (state.following && !state.following.some(user=>user._id===record._id)) ?
                                                        <button className="secondary-content btn-small waves-effect waves-light #1976d2 blue darken-1"
                                                            onClick={()=>followUser(record._id)}>
                                                            Follow</button>
                                                        :
                                                        <button className="secondary-content btn-small waves-effect waves-light #ef5350 red lighten-1"
                                                        onClick={()=>unfollowUser(record._id)}>
                                                            Unfollow</button>
                                                }

                                            </li>
                                        )
                                    })
                                }
                            </ul>)
                            : <h6>No likes yet!</h6>
                    }

                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-close btn-flat">Close</a>
                </div>
            </div>
        </div>
    )
}
export default LikesModal;