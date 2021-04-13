import React, { useEffect, useContext, useState, useRef } from "react";
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';
import { UserContext,SocketContext } from '../../App';

const EditAccountSettings = () => {

    const history = useHistory();
    const { state, dispatch } = useContext(UserContext);
    const {socketState,socketDispatch}=useContext(SocketContext);
    
    const [oldEmail,setOldEmail]=useState("");
    const [oldUsername,setOldUsername]=useState("");
    const [oldPassword,setOldPassword]=useState("");
    
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const postData=()=>{
        setLoading(true);

        if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(oldEmail)) {
            M.toast({ html: "Invalid email!", classes: "#c62828 red darken-1" });
            setLoading(false);
            return;
        }

        if (email&&!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)) {
            M.toast({ html: "Invalid email!", classes: "#c62828 red darken-1" });
            setLoading(false);
            return;
        }

        fetch("/editaccountsettings", {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                oldEmail,
                oldUsername,
                oldPassword,
                email,
                username,
                password
            })
        })
            .then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.error) {
                    setLoading(false);
                    return M.toast({ html: data.error, classes: "#c62828 red darken-1" });
                }
                
                setLoading(false);
                M.toast({ html: data.message, classes: "#43a047 green darken-1" });
                localStorage.clear();
                dispatch({ type: "CLEAR" });
                socketDispatch({ type: "CLEAR_SOCKET_JWT" });
                history.push('/signin');
                
            }).catch(err => {
                setLoading(false);
                console.log(err);
            })
    }

    return (
        <div className="mycard">
            <div className="card auth-card input-field">
            <input
                    type="text"
                    placeholder="old email *"
                    value={oldEmail}
                    onChange={(e) => setOldEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="new email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="old username *"
                    value={oldUsername}
                    onChange={(e) => setOldUsername(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="new username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="old password *"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <p style={{color:"red",fontSize:"13px",fontWeight:"500",margin:"30px 0px"}}>*You will be signed out after Editing Account Settings</p>

                <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                    onClick={() => postData()}
                >
                    Edit Account Settings
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

export default EditAccountSettings