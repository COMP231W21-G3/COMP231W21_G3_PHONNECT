import React, { useEffect, useContext, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import M from 'materialize-css';

const NavBar = () => {

    return (
        <>
            <nav>
                <div className="nav-wrapper white">
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li><Link to="/createpost"><i className="small material-icons navbar-icons">add_circle_outline</i></Link></li>
                        <li><Link to="/chatrooms"><i className="small material-icons navbar-icons">forum</i></Link></li>
                        <li><Link to="/meetastranger"><i className="small material-icons navbar-icons">people</i></Link></li>
                    </ul>
                </div>
            </nav>
        </>
    )
}


export default NavBar;