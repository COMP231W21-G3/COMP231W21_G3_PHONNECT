import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useHistory } from 'react-router-dom';
import M from 'materialize-css';
import PreLoader from '../Preloader';
import { SocketContext, UserContext } from '../../App';

const JitsiRoom = () => {
    const {roomId}=useParams();
    const jitsiContainerId = "jitsi-container-id";
    const [jitsi, setJitsi] = useState({});
    const history=useHistory();
    const [chatroom,setChatroom]=useState({});
    const { state, dispatch } = useContext(UserContext);
    const {socketState:socket,socketDispatch}=useContext(SocketContext);

    useEffect(()=>{
        fetch(`/videochatroom/${roomId}`, {
            method: "get",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                if(result.error){
                    history.push('/');
                    M.toast({ html: result.error, classes: "#c62828 red darken-1" });
                }
                else{
                    console.log(result.chatroom);
                    setChatroom(result.chatroom);
                }
            })
    },[])

    const loadJitsiScript = () => {
        let resolveLoadJitsiScriptPromise = null;

        const loadJitsiScriptPromise = new Promise((resolve) => {
            resolveLoadJitsiScriptPromise = resolve;
        });

        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = resolveLoadJitsiScriptPromise;
        document.body.appendChild(script);

        return loadJitsiScriptPromise;
    };

    const initialiseJitsi = async () => {
        if (!window.JitsiMeetExternalAPI) {
            await loadJitsiScript();
        }

        const domain = 'meet.jit.si';
        const options = {
            roomName: roomId,
            parentNode: document.getElementById(jitsiContainerId),
        };

        const _jitsi = new window.JitsiMeetExternalAPI(domain, options);
        _jitsi.on('readyToClose', () => {
            window.close();
       });

        setJitsi(_jitsi);
    };

    useEffect(() => {
        initialiseJitsi();
        return () => jitsi?.dispose?.();
    }, []);

    return(
        <>
            {chatroom&&
            <div style={{ position:"absolute", width: "100%", top:"64px", bottom:"0px", margin: "0px auto" }}>
                <div id={jitsiContainerId} style={{height:"100%",width:"100%"}}/>
                
                {/* <button style={{height:"100px",width:"100px",backgroundColor:"teal"}}
                onClick={()=>{
                    jitsi.executeCommand('hangup');
                    window.close();
                }}
                >hang up</button> */}
            </div>
            }
        </>
    )
}

export default JitsiRoom;