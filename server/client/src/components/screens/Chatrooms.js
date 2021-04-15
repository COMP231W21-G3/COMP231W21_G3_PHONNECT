import React, { useState, useEffect, useContext, useRef } from 'react';
import PreLoader from '../Preloader';
import { SocketContext, UserContext } from '../../App';
import M from 'materialize-css';
import { Link } from 'react-router-dom';
import Picker from 'emoji-picker-react';
import { isMobile } from 'react-device-detect';

const Chatrooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const { state, dispatch } = useContext(UserContext);
    const {socketState:socket,socketDispatch}=useContext(SocketContext);
    
    const searchParticipantModal = useRef(null);
    const [searchParticipant, setSearchParticipant] = useState("");
    const [participantDetails, setParticipantDetails] = useState([]);
    const [searchParticipantsSelected, setSearchParticipantsSelected] = useState([]);

    const [openedChatroom, setOpenedChatroom] = useState({});
    const [openChatroomLoading, setOpenChatroomLoading] = useState(false);

    const [chatImageUrl, setChatImageUrl] = useState();
    const [tempChatroom,setTempChatroom]=useState({});
    const [tempSender,setTempSender]=useState();

    const searchAddParticipantModal = useRef(null);
    const [searchAddParticipant, setSearchAddParticipant] = useState("");
    const [addParticipantDetails, setAddParticipantDetails] = useState([]);
    const [searchAddParticipantsSelected, setSearchAddParticipantsSelected] = useState([]);

    const chatboxRef = useRef();
    const chatInputRef = useRef();
    const emojiOpenerRef = useRef();
    const imageOpenerRef = useRef();

    const [participantToRemove, setParticipantToRemove] = useState({});

    const allHobbies = ["Reading", "Gaming", "Writing", "Boardgame", "Music", "Fashion", "Painting", 
    "Netflix", "Dining", "Gym", "Sports", "Theatre", "Photography", "Karaoke", "Dancing", "Puzzles", 
    "Podcasts", "Standup", "Anime", "Manga", "Hiking", "Cooking", "Makeup", "Coding","Interior Design"];
    const [selectedHobbies, setSelectedHobbies] = useState([]);
    const [myHobbies, setMyHobbies] = useState([]);
    const [findMatchLoading,setFindMatchLoading] = useState(false);
    const [matches,setMatches]=useState([]);

    useEffect(() => {
        var modals = document.querySelectorAll('.modal');
        M.Modal.init(modals, {});
        var materialboxes = document.querySelectorAll('.materialboxed');
        M.Materialbox.init(materialboxes, {});
        var collapsibles = document.querySelectorAll('.collapsible');
        M.Collapsible.init(collapsibles, {});
    }, [])

    useEffect(() => {
        setLoading(true);
        fetch('/chatrooms', {
            method: "get",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                console.log(result);
                setLoading(false);
                setRooms(result.chatrooms);
                setSearchParticipantsSelected([...searchParticipantsSelected, result.currentUser]);
            })
    }, [])

    const fetchSearchParticipants = (query) => {
        setSearchParticipant(query);
        fetch('/search-participants', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ query })
        })
            .then(res => res.json())
            .then(results => {
                // console.log(results);
                setParticipantDetails(results.searched_partis);
            })
    }

    const addSearchParticipantsSelected = (user) => {
        if (!searchParticipantsSelected.some(p => p._id === user._id)) {
            setSearchParticipantsSelected([...searchParticipantsSelected, user]);
        }
    }

    const removeSearchParticipantSelected = (user) => {
        const newList = searchParticipantsSelected.filter(item => item._id !== user._id);
        setSearchParticipantsSelected(newList);
    }

    const createChatroomLive=()=>{
        setLoading(true);
        socket&&socket.emit("create chatroom",searchParticipantsSelected);
    }

    useEffect(() => {
        socket&&socket.on("create chatroom failed", error => {
            M.toast({ html: error, classes: "#c62828 red darken-1" });
            setLoading(false);
        })

        return () => socket&&socket.removeAllListeners("create chatroom failed");
    })

    useEffect(() => {
        socket&&socket.on("create chatroom success", chatroom => {
            if (chatroom.participants.filter(parti => parti._id === state._id).length > 0) {
                console.log(chatroom);
                setRooms([...rooms, chatroom]);
                setSearchParticipantsSelected([{ _id: state._id, username: state.username, profPic: state.profPic }]);
                openChatroomLive(chatroom._id,state._id);
                setLoading(false);
            }
        })

        return () => socket&&socket.removeAllListeners("create chatroom success");
    })

    const openChatroomLive=(chatroomId,currentUserId)=>{
        setOpenChatroomLoading(true);

        socket&&socket.emit("open chatroom",{chatroomId,currentUserId});
    }

    useEffect(()=>{
        socket&&socket.on("open chatroom success",result=>{
            console.log(result);
            setOpenedChatroom(result);
            setOpenChatroomLoading(false);

            var materialboxes = document.querySelectorAll('.materialboxed');
            M.Materialbox.init(materialboxes, {});
            if(chatboxRef.current) chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        })

        return () => {socket&&socket.removeAllListeners("open chatroom success");}
    })

    const addChatLive=(message)=>{
        socket&&socket.emit("add chat",{message,inChatRoom:openedChatroom.chatroom,sender:state._id});
    }

    const addChatImageLive = async (im) => {
        setTempChatroom(openedChatroom.chatroom);
        setTempSender(state._id);

        const data = new FormData();
        data.append("file", im);
        data.append("upload_preset", "phongstagram");
        data.append("cloud_name", "phongcloudinary");
        let cloudinaryRes = await fetch("https://api.cloudinary.com/v1_1/phongcloudinary/upload", {
            method: "post",
            body: data
        });
        let fetchedData = await cloudinaryRes.json();
        setChatImageUrl(fetchedData.url);
    }

    useEffect(() => {
        if(chatImageUrl){
            socket&&socket.emit("add chat",{image:chatImageUrl,inChatRoom:tempChatroom,sender:tempSender});
        }
    }, [chatImageUrl])

    useEffect(()=>{
        socket&&socket.on("add chat success",chat=>{
            if (openedChatroom) {
                console.log(chat);
                if(!chat.image||(chat.image&&chat.inChatRoom===openedChatroom.chatroom._id)){
                    setOpenedChatroom({ ...openedChatroom, chats: [...openedChatroom.chats, chat] });
                }

                var materialboxes = document.querySelectorAll('.materialboxed');
                M.Materialbox.init(materialboxes, {});
                if(chatboxRef.current) chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
            }
        })

        return () => socket&&socket.removeAllListeners("add chat success");
    })

    const fetchSearchAddParticipants = (query) => {
        setSearchAddParticipant(query);
        fetch('/search-add-participants', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                query,
                chatroom: openedChatroom.chatroom
            })
        })
            .then(res => res.json())
            .then(results => {
                setAddParticipantDetails(results.searched_partis);
            })
    }

    const addSearchAddParticipantsSelected = (user) => {
        if (!searchAddParticipantsSelected.some(p => p._id === user._id)) {
            setSearchAddParticipantsSelected([...searchAddParticipantsSelected, user]);
        }
    }

    const removeSearchAddParticipantSelected = (user) => {
        const newList = searchAddParticipantsSelected.filter(item => item._id !== user._id);
        setSearchAddParticipantsSelected(newList);
    }

    const addParticipantsLive=()=>{
        setLoading(true);
        setOpenChatroomLoading(true);
        
        socket&&socket.emit("add participants",{
            partisToAdd: searchAddParticipantsSelected,
            chatroom: openedChatroom.chatroom,
            currentUser:state
        })
    }

    useEffect(() => {
        socket&&socket.on("add participants failed", error => {
            M.toast({ html: error, classes: "#c62828 red darken-1" });
            setLoading(false);
            setOpenChatroomLoading(false);
        })

        return () => socket&&socket.removeAllListeners("add participants failed");
    })

    useEffect(()=>{
        socket&&socket.on("add participants success",chatroom=>{
            if (rooms.filter(room => room._id === chatroom._id).length > 0) {
                const newRooms = rooms.map(room => {
                    if (room._id === chatroom._id) {
                        return chatroom;
                    }
                    else {
                        return room;
                    }
                })
                setRooms(newRooms);
                setLoading(false);
            }
            else {
                if (chatroom.participants.filter(parti => parti._id === state._id).length > 0) {
                    setRooms([...rooms, chatroom]);
                }
                setLoading(false);
            }

            if (openedChatroom && openedChatroom.chatroom && openedChatroom.chatroom._id === chatroom._id) {
                console.log(chatroom);
                setOpenedChatroom({ ...openedChatroom, chatroom });
                setOpenChatroomLoading(false);

                setSearchAddParticipantsSelected([]);
                setSearchAddParticipant("");
                setAddParticipantDetails([]);
            }
        })

        return () => socket&&socket.removeAllListeners("add participants success");
    })

    const removeParticipantLive=(user)=>{
        setLoading(true);
        setOpenChatroomLoading(true);

        socket&&socket.emit("remove participant",{
            user,
            chatroom: openedChatroom.chatroom,
            currentUser:state
        })
    }

    useEffect(()=>{
        socket&&socket.on("remove participant success",chatroom=>{
            if (rooms.filter(room => room._id === chatroom._id).length > 0) {
                if(chatroom.participants.filter(parti=>parti._id===state._id).length>0){
                    const newRooms = rooms.map(room => {
                        if (room._id === chatroom._id) {
                            return chatroom;
                        }
                        else {
                            return room;
                        }
                    })
                    setRooms(newRooms);
                }
                else{
                    const newRooms = rooms.filter(room=>room._id!==chatroom._id);
                    setRooms(newRooms);
                }
                
                setLoading(false);
            }
            
            if (openedChatroom && openedChatroom.chatroom && openedChatroom.chatroom._id === chatroom._id) {
                console.log(chatroom);
                if(chatroom.participants.filter(parti=>parti._id===state._id).length>0){
                    setOpenedChatroom({ ...openedChatroom, chatroom });
                    setOpenChatroomLoading(false);
                }
                else{
                    setOpenedChatroom();
                    setOpenChatroomLoading(false);
                }

                setSearchAddParticipantsSelected([]);
                setSearchAddParticipant("");
                setAddParticipantDetails([]);
            }
        })

        return () => socket&&socket.removeAllListeners("remove participant success");
    })


    // const openVideoChatRoom = () => {
    //     socket && socket.emit("open videochat room", { chatroom: openedChatroom.chatroom, currentUser: state });
    // }

    // const closeVideoChatRoom=()=>{
    //     socket&&socket.emit("close videochat room",{chatroom:openedChatroom.chatroom,currentUser:state});
    // }

    const selectHobby=(hobby)=>{
        setSelectedHobbies([...selectedHobbies, hobby]);
    }

    const unselectHobby=(hobby)=>{
        const newList = selectedHobbies.filter(selectedHobby => selectedHobby !== hobby);
        setSelectedHobbies(newList);
    }

    useEffect(()=>{
        if(state){
            setMyHobbies(state.hobbies);
            setSelectedHobbies(state.hobbies);
        }
    },[state])

    const updateHobbies=()=>{
        fetch("/changeHobbies", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                selectedHobbies
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.error) {
                    M.toast({ html: data.error, classes: "#c62828 red darken-1" });
                }
                else {
                    localStorage.setItem("user", JSON.stringify({ ...state, hobbies: data.hobbies }));
                    dispatch({ type: "UPDATEHOBBIES", payload: data.hobbies });
                    setMyHobbies(data.hobbies);
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const findMatch=()=>{
        fetch("/findMatch", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                selectedHobbies
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.error) {
                    M.toast({ html: data.error, classes: "#c62828 red darken-1" });
                }
                else {
                    setMatches(data.matches);
                }
            }).catch(err => {
                console.log(err);
            })
    }

    const updateHobbiesAndFindMatch=()=>{
        setFindMatchLoading(true);
        if(selectedHobbies.length>0){
            updateHobbies();
            findMatch();

            setFindMatchLoading(false);

        }
        else{
            M.toast({ html: "Select at least 1 hobby!", classes: "#c62828 red darken-1" });
            setFindMatchLoading(false);
        }
    }

    const matchUser=(match)=>{
        const participants=[state,match];
        console.log(participants);
        setLoading(true);
        socket&&socket.emit("create chatroom",participants);
    }

    return (
        <>
            <div id="meetAStrangerModal" className="modal modal-fixed-footer">
                <div className="modal-content">
                    <h4 className="styled-title">Select Your Hobbies</h4>

                    <div>
                        {allHobbies.map((hobby, i) => (
                            !selectedHobbies.some(selectedHobby => selectedHobby === hobby)
                                ?
                                <div key={i} className="chip" style={{ cursor: "pointer" }}
                                    onClick={() => selectHobby(hobby)}>
                                    <span>{hobby}</span>
                                </div>
                                :
                                <div key={i} className="#bbdefb blue lighten-4 chip" style={{ cursor: "pointer" }}
                                    onClick={() => unselectHobby(hobby)}>
                                    <span>{hobby}</span>
                                </div>
                        ))
                        }
                    </div>
                    
                    <button className="btn waves-effect waves-light #1976d2 blue darken-1"
                        style={{ width: "-webkit-fill-available",margin:"20px 0px" }}
                        onClick={() => updateHobbiesAndFindMatch()}>
                        Update Hobbies & Find Match</button>
                    
                    <h4 className="styled-title">Closest Match</h4>

                    {
                        findMatchLoading
                            ?
                            <div style={{ textAlign: "center" }}><PreLoader /></div>
                            :
                            matches.length > 0
                                ?
                                <ul className="collection">
                                {matches.map((match) => (
                                    <li key={match._id} className="collection-item row">
                                        <div className="col s12" style={{padding:"15px 20px"}}>
                                            <img className="small-profPic" src={match.profPic} />
                                            <span>{match.username}</span>
                                            <button className="btn-small waves-effect waves-light #1976d2 blue darken-1 right" 
                                                onClick={() => matchUser(match)}>Match</button>
                                        </div>
                                        
                                        <div className="col s12">
                                            {match.hobbies.map((hobby, i) => (
                                                !myHobbies.some(myHobby => myHobby === hobby)
                                                    ?
                                                    <div key={i} className="chip">
                                                        <span>{hobby}</span>
                                                    </div>
                                                    :
                                                    <div key={i} className="#bbdefb blue lighten-4 chip">
                                                        <span>{hobby}</span>
                                                    </div>
                                            )
                                            )}
                                        </div>

                                    </li>
                                ))}
                                </ul>
                                :<p>No Match!</p>
                    }

                </div>

                <div className="modal-footer">
                    <a className="modal-close btn-flat">Close</a>
                </div>
            </div>

            <div id="searchParticipantModal" className="modal modal-fixed-footer small-modal" ref={searchParticipantModal}>
                <div className="modal-content">
                    <h4 className="styled-title">Search Participants</h4>

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {
                            state && searchParticipantsSelected ?
                                searchParticipantsSelected.map(item => {
                                    return <div key={item._id} className="#bbdefb blue lighten-4 chip"
                                    >
                                        {item.username}
                                        {
                                            item._id !== state._id &&
                                            <i className="material-icons blue-text"
                                                style={{ cursor: "pointer", fontSize: "18px", marginLeft: "5px", verticalAlign: "middle" }}
                                                onClick={() => { removeSearchParticipantSelected(item) }}>cancel</i>
                                        }

                                    </div>
                                })
                                : <></>
                        }
                    </div>

                    <input
                        type="text"
                        placeholder="search participants"
                        value={searchParticipant}
                        onChange={(e) => fetchSearchParticipants(e.target.value)}
                    />

                    <ul className="collection">
                        {
                            state ?
                                participantDetails.map(item => {
                                    return (
                                        !searchParticipantsSelected.some(a => a._id === item._id) ?
                                            <li key={item._id} className="collection-item avatar" onClick={() => { addSearchParticipantsSelected(item) }} style={{ cursor: "pointer" }}>
                                                <img src={item.profPic} alt="" className="circle" />
                                                <h6 style={{ fontWeight: "500" }} className="title">{item.username}</h6>
                                            </li>
                                            :
                                            <li key={item._id} className="collection-item avatar #bbdefb blue lighten-4" onClick={() => { removeSearchParticipantSelected(item) }} style={{ cursor: "pointer" }}>
                                                <img src={item.profPic} alt="" className="circle" />
                                                <h6 style={{ fontWeight: "500" }} className="title">{item.username}</h6>
                                            </li>
                                    )
                                }) : null
                        }
                    </ul>
                </div>
                <div className="modal-footer">
                    <a className="btn-flat blue-text"
                        onClick={() =>
                            loading ?
                                null :
                                createChatroomLive()}
                    >
                        Create Chatroom</a>
                    <a className="modal-close btn-flat">Close</a>
                </div>
            </div>

            <div id="searchAddParticipantModal" className="modal modal-fixed-footer small-modal" ref={searchAddParticipantModal}>
                <div className="modal-content">
                    <h4 className="styled-title">Search Participants To Add</h4>

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {
                            state && searchAddParticipantsSelected ?
                                searchAddParticipantsSelected.map(item => {
                                    return <div key={item._id} className="#bbdefb blue lighten-4 chip"
                                        
                                    >
                                        {item.username}
                                        {
                                            item._id !== state._id &&
                                            <i className="material-icons blue-text"
                                                style={{ cursor: "pointer", fontSize: "18px", marginLeft: "5px", verticalAlign: "middle" }}
                                                onClick={() => { removeSearchAddParticipantSelected(item) }}>cancel</i>
                                        }

                                    </div>
                                })
                                : <></>
                        }
                    </div>

                    <input
                        type="text"
                        placeholder="search participants to add"
                        value={searchAddParticipant}
                        onChange={(e) => fetchSearchAddParticipants(e.target.value)}
                    />

                    <ul className="collection">
                        {
                            state ?
                                addParticipantDetails.map(item => {
                                    return (
                                        !searchParticipantsSelected.some(a => a._id === item._id) ?
                                            <li key={item._id} className="collection-item avatar" onClick={() => { addSearchAddParticipantsSelected(item) }} style={{ cursor: "pointer" }}>
                                                <img src={item.profPic} alt="" className="circle" />
                                                <h6 style={{ fontWeight: "500" }} className="title">{item.username}</h6>
                                            </li>
                                            :
                                            <li key={item._id} className="collection-item avatar #bbdefb blue lighten-4" onClick={() => { removeSearchAddParticipantSelected(item) }} style={{ cursor: "pointer" }}>
                                                <img src={item.profPic} alt="" className="circle" />
                                                <h6 style={{ fontWeight: "500" }} className="title">{item.username}</h6>
                                            </li>
                                    )
                                }) : null
                        }
                    </ul>
                </div>
                <div className="modal-footer">
                    <a className="btn-flat blue-text"
                        onClick={() =>
                            loading && openChatroomLoading ?
                                null :
                                addParticipantsLive()}
                                >
                        Add Participant(s)</a>
                    <a className="modal-close btn-flat">Close</a>
                </div>
            </div>

            <div id="removeParticipantModal" className="modal modal-fixed-footer small-modal">
                <div className="modal-content">
                    <h4 className="styled-title">Remove Participant</h4>
                    <p>Are you sure you want to remove this participant? </p>
                    <p className="red-text">(Removing the last participant will result in deletion of the chatroom and its chats)</p>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-close btn-flat red-text"
                        onClick={() => {
                            removeParticipantLive(participantToRemove);
                            setParticipantToRemove({});
                        }}
                    >Remove Participant</a>
                    <a className="modal-close btn-flat">Close</a>
                </div>
            </div>
            
            <div className="row" style={{ maxWidth: "800px", margin: "20px auto" }}>
                <div className="col s12" style={{marginBottom:"10px"}}>
                    <a className="btn-floating btn-large waves-effect waves-light #1976d2 blue darken-1 modal-trigger" data-target="searchParticipantModal"
                        style={{ width: "40px", height: "40px" }}>
                        <i className="material-icons"
                            style={{ lineHeight: "40px" }}
                        >add</i></a>

                    <a className="btn waves-effect waves-light #1976d2 blue darken-1 white-text modal-trigger" data-target="meetAStrangerModal"
                        style={{ height: "40px", float:"right",borderRadius:"40px" }}>
                        Meet A Stranger</a>

                </div>

                <div className="col s4 chatrooms-list">
                    <div className="collection" style={{fontSize:"12px"}}>
                        {
                            loading ?
                                <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                                    <PreLoader />
                                </div>
                                :
                                rooms &&
                                rooms.map(room => {
                                    return (
                                        <a href="#!" className={openedChatroom && openedChatroom.chatroom
                                            && openedChatroom.chatroom._id === room._id
                                            ? "collection-item active #b3e5fc light-blue lighten-4"
                                            : "collection-item"}
                                            key={room._id}
                                            onClick={() => { openChatroomLive(room._id,state._id) }}
                                            >
                                            <div className="chatroom-title">
                                                {/* {!room.lastSeenBy.includes(state._id)&&<span className="new badge blue" data-badge-caption="new"></span>} */}
                                                {
                                                    room.participants.map(parti => {
                                                        return <span key={parti._id}>{parti.username} </span>
                                                    })
                                                }    
                                            </div>
                                        </a>
                                    )
                                })
                        }
                    </div>
                </div>

                <div className="col s8">
                    <div className="card large" style={{ height: "560px", borderRadius: "20px", position: "relative" }}>
                        {openChatroomLoading ?
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                <PreLoader />
                            </div> :
                            <div className="card-content">
                                <div className="card-title row" style={{ borderBottom: "1px solid gray", paddingBottom: "10px" }}>
                                    {
                                        openedChatroom && openedChatroom.chatroom ?
                                            <>
                                                <div className="chatroom-title col s10">{openedChatroom.chatroom.participants.map(parti => parti.username).join(" ")}</div>
                                                <i className="material-icons right col s1 activator" style={{ cursor: "pointer" }}>more_vert</i>
                                                <Link target="_blank" to={`/videocall/${openedChatroom.chatroom._id}`}>
                                                <i className="material-icons right col s1" 
                                                >call</i>
                                                </Link> 
                                            </>
                                            : "Ready to chat?"
                                    }
                                </div>

                                <div className="chat-box" ref={chatboxRef}>
                                    {
                                        openedChatroom && openedChatroom.chats ?
                                            openedChatroom.chats.map(chat => {
                                                return (
                                                    <div key={chat._id}>
                                                        {
                                                            chat.sender?
                                                            chat.sender._id === state._id ?
                                                                <div className="mine messages">
                                                                    <div className="message #1976d2 blue darken-1">
                                                                        {chat.message
                                                                            ? chat.message
                                                                            : chat.image
                                                                                ? chat.image.substring(chat.image.lastIndexOf('.') + 1, chat.image.length).match(/(jpg|jpeg|png|gif)$/i)
                                                                                    ? <img className="upload-img materialboxed"
                                                                                        src={chat.image && chat.image}></img>
                                                                                    : <video className="upload-img"
                                                                                        frameBorder="0" controls src={chat.image && chat.image}></video>
                                                                                : null
                                                                        }
                                                                    </div>
                                                                    <div className="mytime grey-text">{new Date(chat.createdAt).toLocaleString()}</div>
                                                                </div>
                                                                :
                                                                <div className="yours messages">
                                                                    <div>
                                                                        <img className="small-profPic" src={chat.sender.profPic} />
                                                                        <span style={{ fontWeight: "300", fontSize: "1.1em" }}>{chat.sender.username}</span>
                                                                    </div>
                                                                    <div className="message">
                                                                        {chat.message
                                                                            ? chat.message
                                                                            : chat.image
                                                                                ? chat.image.substring(chat.image.lastIndexOf('.') + 1, chat.image.length).match(/(jpg|jpeg|png|gif)$/i)
                                                                                    ? <img className="upload-img materialboxed"
                                                                                        src={chat.image && chat.image}></img>
                                                                                    : <video className="upload-img"
                                                                                        frameBorder="0" controls src={chat.image && chat.image}></video>
                                                                                : null
                                                                        }
                                                                    </div>
                                                                    <div className="yourtime grey-text">{new Date(chat.createdAt).toLocaleString()}</div>
                                                                </div>
                                                            
                                                            :<p className="chatroom-common-message">{chat.message}</p>

                                                        }
                                                    </div>
                                                )
                                            })
                                            : 
                                            <>
                                                <div className="yours messages">
                                                    <div>
                                                        <img className="small-profPic" src="https://res.cloudinary.com/phongcloudinary/image/upload/v1607224047/robotava_wmqaz7.png" />
                                                        <span style={{ fontWeight: "300", fontSize: "1.1em" }}>Phonnect</span>
                                                    </div>
                                                    <div className="message">
                                                        Create a new chatroom, or join an existing chatroom from the left pane!
                                                        <br/><br/>
                                                        You can add/remove participants, or join a Jitsi Meet
                                                        call by clicking on the top-right icons of the chatroom pane.
                                                    </div>
                                                    <div className="yourtime grey-text">{new Date().toLocaleString()}</div>
                                                </div>
                                            </>
                                    }
                                </div>

                                <div>

                                    {openedChatroom && openedChatroom.chatroom &&
                                        <>
                                            {!isMobile &&

                                                <Picker onEmojiClick={(_e, emojiObject) => {
                                                    chatInputRef.current.value += emojiObject.emoji;
                                                }} />
                                            }



                                            <div className="row">

                                                <div className="col s1" style={{ marginTop: "10px" }}>
                                                    {!isMobile &&
                                                        <i className="material-icons chat-features" ref={emojiOpenerRef}
                                                            onClick={e => {
                                                                var emojiPicker = document.getElementsByClassName("emoji-picker-react")[0];
                                                                if (emojiPicker.style.visibility === "hidden" || !emojiPicker.style.visibility) {
                                                                    emojiPicker.style.visibility = "visible";
                                                                    emojiOpenerRef.current.style.color = "#1E88E5";
                                                                }
                                                                else {
                                                                    emojiPicker.style.visibility = "hidden";
                                                                    emojiOpenerRef.current.style.color = "black";
                                                                }
                                                            }}
                                                        >tag_faces</i>}

                                                    <div>

                                                        <div className="file-field" style={{ overflow: "hidden", width: "fit-content" }}>
                                                            <div>
                                                                <span><i ref={imageOpenerRef} className="material-icons chat-features">image</i></span>
                                                                <input type="file" accept="image/jpg,image/jpeg,image/png,image/gif,video/mp4"
                                                                    onChange={(e) => { addChatImageLive(e.target.files[0]) }}
                                                                />
                                                            </div>
                                                            <div className="file-path-wrapper" style={{ display: "none" }}>
                                                                <input className="file-path validate" type="text" placeholder="No Image" disabled />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="col s11">
                                                    <textarea ref={chatInputRef} type="text" placeholder="Add chat" style={{ height: "80px" }} className="stylized-input"
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter" && !e.shiftKey) {
                                                                if (chatInputRef.current.value.replace(/\s/g,'') != "") {
                                                                    addChatLive(e.target.value);
                                                                }
                                                                chatInputRef.current.value = "";
                                                                chatInputRef.current.blur();
                                                            }
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        </>
                                    }
                                </div>

                            </div>
                        }

                        {
                            openedChatroom&&
                            <div className="card-reveal">
                            {
                                openChatroomLoading ?
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                        <PreLoader />
                                    </div> :
                                    <>
                                        <div style={{ marginBottom: "5px" }}>
                                            <a className="btn-floating btn-large waves-effect waves-light #1976d2 blue darken-1 modal-trigger" data-target="searchAddParticipantModal"
                                                style={{ width: "40px", height: "40px" }}>
                                                <i className="material-icons"
                                                    style={{ lineHeight: "40px" }}
                                                >group_add</i></a>
                                                

                                            <i className="material-icons right card-title">close</i>
                                        </div>

                                        <span style={{ fontSize: "24px", fontWeight: "300" }}>Participants</span>



                                        {openedChatroom && openedChatroom.chatroom &&
                                            <ul className="collection">
                                                {
                                                    openedChatroom.chatroom.participants.map((record) => {
                                                        return (

                                                            <li key={record._id} className="collection-item avatar">

                                                                <Link to={record._id == state._id ? "/profile" : `/profile/${record.username}`}>
                                                                    <img src={record.profPic} alt="" className="circle" style={{ objectFit: "cover" }} />
                                                                    <h6 style={{ fontWeight: "500" }} className="title">  {record.username}</h6></Link>

                                                                <a className="secondary-content btn-floating btn-large waves-effect waves-light #ef5350 red lighten-1 modal-trigger"
                                                                    data-target="removeParticipantModal"
                                                                    style={{ width: "40px", height: "40px" }}>
                                                                    <i className="material-icons"
                                                                        style={{ lineHeight: "40px" }}
                                                                        onClick={() => {
                                                                            setParticipantToRemove(record);
                                                                        }}
                                                                    >remove</i></a>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        }
                                    </>
                            }

                        </div>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chatrooms