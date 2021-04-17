import React from 'react';
import { Link } from 'react-router-dom';

const HomePostOptions = ({ item, state, deletePost, followUser, unfollowUser }) => {
    return (
        <div className="collection">
            <Link to={`/post/${item._id}`} className="collection-item">View Post</Link>
            {item.postedBy._id == state._id ?
                <div>
                    <Link to={`/profile`} className="collection-item">
                        View Profile</Link>
                    <Link to={`/editpost/${item._id}`} className="collection-item">Edit Post</Link>
                    <a href="#!" className="collection-item red-text" onClick={() => deletePost(item._id)}>Delete Post</a>
                </div>
                : <div>
                    <Link to={state.username===item.postedBy.username?'/profile':`/profile/${item.postedBy.username}`} className="collection-item">
                        View Profile</Link>
                    {
                        !state.following || (state.following && !state.following.some(user=>user._id===item.postedBy._id)) ?
                            <a href="#!" className="collection-item blue-text"
                                onClick={() => followUser(item.postedBy._id)}>
                                Follow</a>
                            :
                            <a href="#!" className="collection-item red-text"
                                onClick={() => unfollowUser(item.postedBy._id)}>
                                Unfollow</a>
                    }
                </div>
            }
        </div>
    )
}

export default HomePostOptions