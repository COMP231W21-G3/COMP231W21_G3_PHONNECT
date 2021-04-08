import React, { useState, useContext} from 'react';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const ResetPassword = () => {
    const history = useHistory();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const postData = () => {
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            M.toast({ html: "Invalid email!", classes: "#c62828 red darken-1" });
            return;
        }
        
        setLoading(true);
        fetch("/reset-password", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email
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

                <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                    onClick={() => postData()}
                >
                    Reset Password
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

export default ResetPassword