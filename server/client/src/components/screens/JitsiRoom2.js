import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext, UserContext } from '../../App';
import { useParams } from 'react-router-dom';
import { Link, useHistory } from 'react-router-dom';
import Jitsi from 'react-jitsi';
import M from 'materialize-css';
import PreLoader from '../Preloader';

const JitsiRoom2 = () => {
    const { state, dispatch } = useContext(UserContext);
    const {roomId}=useParams();
    const history=useHistory();
    const [chatroom,setChatroom]=useState({});

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

    const interfaceConfig={
        SETTINGS_SECTIONS: [ 'devices', 'language' ],
        TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "videoquality",
            "tileview",
            "download",
            "help",
            "mute-everyone",
            "recording",
            "desktop",
            "raisehand",
            "settings",
          ]
    }

    const Loader=()=>{
        return (
            <div style={{display:"flex",justifyContent:"center",margin:"20px auto"}}>
                <PreLoader />
            </div>
        )
    }

    const handleAPI = JitsiMeetAPI => {
        JitsiMeetAPI.executeCommand("toggleAudio");
        JitsiMeetAPI.executeCommand("toggleVideo");
      };

    return (
        <>
        {state&&chatroom&&
            <div style={{ position:"absolute", width: "100%", top:"64px", bottom:"0px", margin: "0px auto" }}>
                <Jitsi
                    roomName={roomId}
                    displayName={state.username}

                    onAPILoad={handleAPI}

                    config={{
                        disableDeepLinking: true,
                        prejoinPageEnabled: false
                    }}

                    interfaceConfig={interfaceConfig}

                    loadingComponent={Loader}

                    containerStyle={{ width: "100%", height: "100%" }}
                />
        </div>}
        </>
    )
}
