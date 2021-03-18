import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import M from 'materialize-css';

const PreLoader = () => {

    return (
        <div className="preloader-wrapper medium active">
            <div className="spinner-layer spinner-blue-only">
                <div className="circle-clipper left">
                    <div className="circle"></div>
                </div><div className="gap-patch">
                    <div className="circle"></div>
                </div><div className="circle-clipper right">
                    <div className="circle"></div>
                </div>
            </div>
        </div>
    )
}

export default PreLoader;