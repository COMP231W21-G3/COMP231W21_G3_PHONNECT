import React from 'react';
import { Link } from 'react-router-dom';

const HomePostOptions = ({ item, state, deletePost }) => {
    return (
        <div className="collection">
                <div>
                    <a href="#!" className="collection-item red-text" onClick={() => deletePost(item._id)}>Delete Post</a>
                    <a href="#!" className="collection-item">Edit Post</a>
                </div>
        </div>
    )
}

export default HomePostOptions