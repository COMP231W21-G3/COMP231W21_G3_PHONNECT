import React, { useEffect } from "react";
import M from "materialize-css";
import {Link} from 'react-router-dom';

const CommentsModal = ({ item, state, deleteComment }) => {
    useEffect(() => {
        var modal = document.querySelectorAll('.modal');
        M.Modal.init(modal, {});
    }, [])

    return (
        <div>
            <a className="modal-trigger grey-text" href={`#comments-${item._id}`}>View {item.comments.length} comments</a>

            <div id={`comments-${item._id}`} className="modal modal-fixed-footer small-modal">
                <div className="modal-content">
                    <h4 className="card-title">Comments</h4>
                    {
                        item.comments.map((record) => {
                            return (
                                <div className="row comment-row" key={record._id}>
                                    <p className="col s10" style={{ wordWrap: "break-word" }}>
                                        <span style={{ fontWeight: "500", paddingRight: "3px" }}>
                                            <Link to={record.postedBy._id == state._id ? "/profile" : `/profile/${record.postedBy.username}`}>

                                                {record.postedBy.username}</Link>
                                        </span>
                                        {record.text}</p>

                                    {record.postedBy._id == state._id
                                        && (
                                            <i className="material-icons col s2 red-text" 
                                                style={{ cursor: "pointer", fontSize: "1.5em"}} 
                                                onClick={() => deleteComment(item._id, record._id)}>
                                                delete
                                            </i>
                                        )}

                                </div>
                            )
                        })
                    }
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-close btn-flat">Close</a>
                </div>
            </div>
        </div>
    )
}
export default CommentsModal;