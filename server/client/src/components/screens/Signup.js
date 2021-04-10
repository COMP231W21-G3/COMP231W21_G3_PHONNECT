import React, { useState,useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const Signup = () => {

    const history = useHistory();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState("");
    const [url, setUrl] = useState(undefined);

    const uploadProfPic=()=>{
        setLoading(true);
        const data=new FormData();
        data.append("file", image);
        data.append("upload_preset", "phongstagram");
        data.append("cloud_name", "phongcloudinary");
        fetch("https://api.cloudinary.com/v1_1/phongcloudinary/image/upload", {
                method: "post",
                body: data
            })
           .then(res=>res.json())
           .then(data=>{
               setUrl(data.url)
            }).catch(err=>{
                console.log(err);
                setLoading(false);
            })
    }
    
    useEffect(()=>{
        if(url){
            uploadFields();
        }
    },[url])

    const uploadFields=()=>{

        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            M.toast({ html: "Invalid email!", classes: "#c62828 red darken-1" });
            setLoading(false);
            return;
        }

        fetch("/signup", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                username,
                password,
                profPic:url
            })
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.error) {
                    M.toast({ html: data.error, classes: "#c62828 red darken-1" });
                }
                else {
                    M.toast({ html: data.message, classes: "#43a047 green darken-1" });
                    history.push('/signin');
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const postData = () => {
        if(image){
            uploadProfPic();
        }
        else{
            setLoading(true);
            uploadFields();
        }
    }

    return (
        <div className="mycard">
            <div className="card auth-card input-field">
                <h2>Phongstagram</h2>
                <input
                    type="text"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div>
                    {
                        !image? <img className="upload-profPic"
                        src="https://res.cloudinary.com/phongcloudinary/image/upload/v1601519288/profile_jbknw2.png" />
                            :
                                <img className="upload-profPic"
                                    src={image?URL.createObjectURL(image):null}></img>
                    }
                </div>
                
                <div className="file-field input-field">
                    <div className="btn waves-effect waves-light #1976d2 blue darken-1">
                        <span>Upload Profile Pic</span>
                        <input type="file" accept="image/*" 
                            onChange={(e)=>setImage(e.target.files[0])} />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" placeholder="No Image" disabled/>
                    </div>
                </div>

                <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                    onClick={() => postData()}
                >
                    Sign Up
                </button>
                <h6>
                    <Link to="/signin">Already have an account?</Link>
                </h6>
            </div>

            {loading ?
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader></PreLoader>
                </div>
                : null}

        </div>
    )
}

export default Signup