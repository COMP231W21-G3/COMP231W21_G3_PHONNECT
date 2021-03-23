import React, { useEffect, useContext, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import M from 'materialize-css';

const NavBar = () => {

    return (
        <>
            <li><Link to="/createpost"><i className="small material-icons navbar-icons">add_circle_outline</i></Link></li>
            <nav>
                <div className="nav-wrapper white">
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li><Link to="/createpost"><i className="small material-icons navbar-icons">add_circle_outline</i></Link></li>
                        <li><Link to="/voicecommand"><i className="small material-icons navbar-icons">keyboard_voice</i></Link></li>
                        <li><Link to="/chatrooms"><i className="small material-icons navbar-icons">forum</i></Link></li>
                    </ul>
                </div>
            </nav>
            <li><Link to="/voicecommand"><i className="small material-icons navbar-icons">add_circle_outline</i></Link></li>
        </>
    )
}


export default NavBar;