import React, { useState,useEffect, useContext} from 'react';
import { Link, useHistory,useParams } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const NewPassword = () => {
    const history = useHistory();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {token}=useParams();

    useEffect(()=>{
        console.log(token);
    },[])

    const postData = () => {
        setLoading(true);

        if(password.length<6){
            M.toast({ html: "Password cannot be less than 6 characters!", classes: "#c62828 red darken-1" });
            setLoading(false);
            return;
        }

        fetch("/new-password", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password,
                token
            })
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                console.log(data);
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

    return (
        <div className="mycard">
            <div className="card auth-card input-field">
                <h2>Phongstagram</h2>

                <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                    onClick={() => postData()}
                >
                    Update password
                </button>
            </div>

            {loading ?
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader></PreLoader>
                </div>
                : null}

        </div>
    )
}

export default NewPassword