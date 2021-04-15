import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const CreateServiceRequest = () => {
    const history = useHistory();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const createServiceRequest=()=>{
        setLoading(true);
        fetch("/create_service_request", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                title,
                description
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
                    M.toast({ html: "Service Request Sent Successfully!", classes: "#43a047 green darken-1" });
                    history.push('/');
                }
            }).catch(err => {
                console.log(err);
            })
    }
    
    return (
        <div className="card input-field"
            style={{
                margin: "30px auto",
                maxWidth: "500px",
                padding: "20px",
                textAlign: "center"
            }}>
       
            <input type="text" placeholder="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            <textarea className="stylized-input" placeholder="description" style={{height:"400px"}}
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            
            <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                onClick={() => createServiceRequest()}
            >
                Send Service Request
            </button>

            {loading ?
                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                    <PreLoader></PreLoader>
                </div>
                : null}

        </div>
    )
}

export default CreateServiceRequest