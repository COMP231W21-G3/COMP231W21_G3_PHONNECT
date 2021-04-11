import React, { useEffect, useContext, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import { SocketContext, UserContext } from "../App";

const NavBar = () => {
    const { state, dispatch } = useContext(UserContext);

    const fetchUsers = (query) => {
        setSearch(query);
        fetch('/search-users', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ query })
        })
            .then(res => res.json())
            .then(results => {
                console.log(results);
                setUserDetails(results.users);
            })
    }

    const renderList = () => {
        if (state) { //state will be populated with user details on USER action, else it will be initialState null
            return (
                <>
                    <li><Link to="/"><i className="small material-icons navbar-icons">home</i></Link></li>
                    <li><Link to="/allposts"><i className="small material-icons navbar-icons">public</i></Link></li>
                    <li><Link to="/profile"><i className="small material-icons navbar-icons">account_circle</i></Link></li>
                    <li><Link to="/createpost"><i className="small material-icons navbar-icons">add_circle_outline</i></Link></li>
                    <li><Link to="/chatrooms"><i className="small material-icons navbar-icons">forum</i></Link></li>
                    <li><Link to="/signin"
                        onClick={() => {
                            localStorage.clear();
                            dispatch({ type: "CLEAR" });
                            dispatch({type:"CLEAR_SOCKET_JWT"});
                        }}
                    ><i className="small material-icons" style={{color:"red"}}>exit_to_app</i></Link></li>
                </>
            )
        }
        else {
            return (
                <>
                    <li><Link to="/signin">Sign In</Link></li>
                    <li><Link to="/signup">Sign Up</Link></li>
                </>
            )
        }
    }

    const renderMobileList = () => {
        if (state) {
            return (
                <>
                    <li className="sidenav-close"><Link to="/">Home</Link></li>
                    <li className="sidenav-close"><Link to="/allposts">All Posts</Link></li>
                    <li className="sidenav-close"><Link to="/profile">Profile</Link></li>
                    <li className="sidenav-close"><Link to="/createpost">Create Post</Link></li>
                    <li className="sidenav-close"><Link to="/chatrooms">Chatrooms</Link></li>
                    <li className="sidenav-close"><Link to="/signin"
                        onClick={() => {
                            localStorage.clear();
                            dispatch({ type: "CLEAR" });
                            dispatch({type:"CLEAR_SOCKET_JWT"});
                        }}

                    ><span style={{color:"red"}}>Sign Out</span></Link></li>
                </>
            )
        }
        else {
            return (
                <>
                    <li className="sidenav-close"><Link to="/signin">Sign In</Link></li>
                    <li className="sidenav-close"><Link to="/signup">Sign Up</Link></li>
                </>
            )
        }
    }

    useEffect(
        () => {
            var sidenavs = document.querySelectorAll('.sidenav');
            M.Sidenav.init(sidenavs, {});
        }, []
    )

    return (
        <>
            <div className="navbar-fixed">
                <nav>
                    <div className="nav-wrapper white">

                        <Link to={state ? "/" : "/signin"} className="brand-logo">Phonnect</Link>
                        <Link to="/" data-target="mobile-demo" className="sidenav-trigger"><i className="material-icons">menu</i></Link>
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            {renderList()}
                        </ul>
                    </div>
                </nav>
            </div>

            <ul className="sidenav" id="mobile-demo">
                {renderMobileList()}
            </ul>                 
        </>
    )
}

export default NavBar;