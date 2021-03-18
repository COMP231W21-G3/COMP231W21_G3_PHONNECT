import React, { useEffect, useContext, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import M from 'materialize-css';

const NavBar = () => {

    return (
        <>
            <li><Link to="/createpost"><i className="small material-icons navbar-icons">add_circle_outline</i></Link></li>
        </>
    )
}


export default NavBar;