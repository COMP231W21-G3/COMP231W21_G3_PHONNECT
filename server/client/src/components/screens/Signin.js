import React, { useState, useContext} from 'react';
import { Link, useHistory } from 'react-router-dom';
import {socket, SocketContext, UserContext} from '../../App';
import M from 'materialize-css';
import PreLoader from '../Preloader';
import io from 'socket.io-client';

const Signin = () => {
    const {state,dispatch}=useContext(UserContext);
    const {socketState:socket,socketDispatch}=useContext(SocketContext);

    const history = useHistory();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const postData = () => {
        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            M.toast({ html: "Invalid email!", classes: "#c62828 red darken-1" });
            return;
        }
        
        setLoading(true);
        fetch("/signin", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
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
                    localStorage.setItem("jwt",data.token);
                    localStorage.setItem("user",JSON.stringify(data.user));
                    dispatch({type:"USER",payload:data.user});
                    socketDispatch({type:"SOCKET_JWT",payload:data.token});
                    

                    M.toast({ html: "Signed In Successfully!", classes: "#43a047 green darken-1" });
                    history.push('/');
                }
            }).catch(err => {
                console.log(err);
            })
    }

    return (
        <div className="mycard">
            <div className="card auth-card input-field">
                <h2>Phonnect</h2>
                <input
                    type="text"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                    onClick={() => postData()}
                >
                    Sign In
                </button>
                <h6>
                    <Link to="/signup">Don't have an account?</Link>
                </h6>
                <h6 style={{fontSize:"1em"}}>
                    <Link to="/resetpassword">Forgot password?</Link>
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

export default Signin