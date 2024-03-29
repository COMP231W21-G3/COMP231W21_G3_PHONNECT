import React, { useEffect, useState,useContext } from "react";
import { Link, useHistory } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import M from 'materialize-css';
import axios from 'axios';
import { SocketContext, UserContext } from "../App";

const VoiceCommand = ({pageContent}) => {
    const { state, dispatch } = useContext(UserContext);
    const {socketState,socketDispatch}=useContext(SocketContext);
    const history=useHistory();

    const { transcript,
        interimTranscript,
        finalTranscript,
        resetTranscript,
        listening, } = useSpeechRecognition();

    const [actions,setActions] = useState([]);
    const [objects,setObjects] = useState([]);
    const [functions,setFunctions] = useState([]);

    var speech = new SpeechSynthesisUtterance();
    var synth = window.speechSynthesis;

    class Action {
        constructor(action_key, action_keywords, action_suggestions) {
            this.action_key = action_key;
            this.action_keywords = action_keywords;
            this.action_suggestions = action_suggestions;
        }
    }

    class Obj {
        constructor(object_key, object_keywords, object_suggestions) {
            this.object_key = object_key;
            this.object_keywords = object_keywords;
            this.object_suggestions = object_suggestions;
        }
    }

    class Function {
        constructor(function_name, action_key, object_key) {
            this.function_name = function_name;
            this.action_key = action_key;
            this.object_key = object_key;
        }
    }

    const retrieveMappings = (xml) => {

        var i, xmlDoc, xmlKey, xmlWord, xmlSuggestion, xmlFName, xmlFAKey, xmlFOKey;

        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml, 'text/xml');

        // Build list of Actions
        xmlKey = xmlDoc.getElementsByTagName("ACTION_ACTION_KEY");
        xmlWord = xmlDoc.getElementsByTagName("ACTION_KEYWORDS");
        xmlSuggestion = xmlDoc.getElementsByTagName("ACTION_SUGGESTIONS");
        
        for (i = 0; i < xmlKey.length; i++) {
            let action = new Action(xmlKey[i].childNodes[0].nodeValue, xmlWord[i].childNodes[0].nodeValue, xmlSuggestion[i].childNodes[0].nodeValue);
            actions.push(action);
    
        }

        // Build list of Objects
        xmlKey = xmlDoc.getElementsByTagName("OBJECT_OBJECT_KEY");
        xmlWord = xmlDoc.getElementsByTagName("OBJECT_KEYWORDS");
        xmlSuggestion = xmlDoc.getElementsByTagName("OBJECT_SUGGESTIONS");

        for (i = 0; i < xmlKey.length; i++) {
            let obj = new Obj(xmlKey[i].childNodes[0].nodeValue, xmlWord[i].childNodes[0].nodeValue, xmlSuggestion[i].childNodes[0].nodeValue);
            objects.push(obj);
        }

        // Build list of Functions
        xmlFName = xmlDoc.getElementsByTagName("FUNCTION_NAME");
        xmlFAKey = xmlDoc.getElementsByTagName("ACTION_KEY");
        xmlFOKey = xmlDoc.getElementsByTagName("OBJECT_KEY");

        for (i = 0; i < xmlFName.length; i++) {
            let func = new Function(xmlFName[i].childNodes[0].nodeValue, xmlFAKey[i].childNodes[0].nodeValue, xmlFOKey[i].childNodes[0].nodeValue);
            functions.push(func);
        }
        
        console.log("End On Load XML")
    }

    useEffect(() => {
        var taptargets = document.querySelectorAll('.tap-target');
        var instances = M.TapTarget.init(taptargets, {});
        instances[0].open();

        if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
            return null
        }
    }, [])

    useEffect(() => {
        axios.get("mappings/speechmapping.xml", {
            "Content-Type": "application/xml; charset=utf-8"
        })
            .then((xmlhttp) => {
                //console.log(xmlhttp.data);
                retrieveMappings(xmlhttp.data);
            });
    }, [])

    const executeFunction = (function_name) => {
        switch (function_name) {
            case "nav_chatrooms":
                nav_chatrooms();
                break;
            case "nav_feed":
                nav_feed();
                break;
            case "nav_profile":
                nav_profile();
                break;
            case "do_createpost":
                do_createpost();
                break;
            case "meet_stranger":
                meet_stranger();
                break;
            case "search_user":
                search_user();
                break;
            case "sign_out":
                sign_out();
                break;
            // case "do_message":
            //     do_message();
            //     break;
            default:
                console.log("Did not find function to execute");
        }
    }


    // Add Speech Functions Below. Try to keep consistent with speechmappings.
    const nav_chatrooms=() => {
        readOutLoud("Going to chatroom page");
        history.push("/chatrooms");
    }

    const nav_feed=()=> {
        console.log("Execute nav_feed function");
        history.push("/");
    }

    const nav_profile=()=> {
        readOutLoud("Going to profile page");
        history.push("/profile");
    }

    const do_createpost=()=> {
        readOutLoud("Going to content post page");
        history.push("/createpost");
    }

    const meet_stranger=() => {
        readOutLoud("Navigate to your Chatrooms page. The Meet A Stranger button is at the top right corner of your page");
        history.push("/chatrooms");
    }

    const search_user=()=> {
        readOutLoud("The Search User button is the leftmost button on your navigation bar. Enter the name of an user and click on their username in the suggested list to go to their profile")
    }

    const sign_out=()=> {
        readOutLoud("Signing out");
        localStorage.clear();
        dispatch({ type: "CLEAR" });
        socketDispatch({type:"CLEAR_SOCKET_JWT"});
        history.push("/signin");
    }

    const readOutLoud=(message)=> {
        // Set the text and voice attributes.

        speech.text = message;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        speech.voice = synth.getVoices()[4];

        window.speechSynthesis.speak(speech);
    }

    useEffect(() => {
        if (finalTranscript != '') {

            var instruction = document.getElementById("instruction");
            var speechInput = document.getElementById("speechInput");
            var suggestionList = document.getElementById("suggestions");
            var suggestionDiv = document.getElementById("suggestionDiv");
            var suggestionIntro = document.getElementById("suggestionIntro");

            console.log("captured speech: " + finalTranscript);
            speechInput.innerText = finalTranscript;

            var resultFunction = GetFunctionName(finalTranscript);

            console.log("FUNCTION RESULT: " + resultFunction[0]);
            console.log("FUNCTION SUGGESTION: " + resultFunction[1]);
            console.log("FUNCTION RESPONSETEXT: " + resultFunction[2]);

            if (resultFunction[0] != "undetermined") {

                // Hide Suggestion Div
                suggestionDiv.style.display = "none";

                console.log("FUNCTION: " + resultFunction[0]);
                executeFunction(resultFunction[0]);

            }
            else {
                console.log("Cannot find a function name, showing suggestions");
                var parseSuggestions = resultFunction[1].split("~");
                console.log("Suggestions: " + parseSuggestions);

                // Show Suggestion Div
                suggestionDiv.style.display = "block";
                suggestionList.innerHTML = "";

                var responseVoiceItems = "";
                var count = 0;


                parseSuggestions.forEach(suggestion => {
                    count++;
                    var list = document.createElement("li");
                    list.className="collection-item";
                    list.textContent = suggestion;
                    suggestionList.appendChild(list);
                    responseVoiceItems += " " + suggestion + ",";
                });

                // Fix up string for response
                if (count > 1) {
                    responseVoiceItems = responseVoiceItems.slice(0, -1);
                    var or = responseVoiceItems.lastIndexOf(",");
                    responseVoiceItems = responseVoiceItems.substring(0, or + 1) + " or " + responseVoiceItems.substring(or);
                }


                if (resultFunction[2] == "") {
                    var response = "I'm sorry. I do not understand that command.";
                    readOutLoud(response);
                }
                else {
                    var response = "I couldn't understand what you said. I heard the word \"" + resultFunction[2] + "\". Try saying: ";
                    readOutLoud(response + responseVoiceItems);
                }

                suggestionIntro.innerHTML = response;
            }
        }
    }, [interimTranscript, finalTranscript])

    function GetFunctionName(inputString) {
        console.log("Enter GetFunctionName with input: " + inputString);

        // 1. Input is a speech string
        // 2. Parse speech string to words
        // 3. Match each word to either an action keyword or object keyword
        // 4. Output is an action key and an object key
        // Assumption is the last match will be taken (ex. I want to "go" "send" a message, the last action word send will be used)

        var parseSpeechInput = inputString.split(" ");
        // Remove blank spaces
        parseSpeechInput = parseSpeechInput.filter(item => item);
        console.log(parseSpeechInput);

        var actionMatch = "";
        var objectMatch = "";
        var actionSuggestion = "";
        var objectSuggestion = "";
        var actionExactWord = "";
        var objectExactWord = "";

        parseSpeechInput.forEach(word => {

            actions.forEach(a => {

                var aKeyword = a.action_keywords.split("~");
                aKeyword.forEach(w => {

                    if (w.toLowerCase() == word.toLowerCase()) {
                        console.log("found action match: " + word);
                        actionMatch = a.action_key;
                        console.log("suggestion for action " + a.action_suggestions);
                        actionSuggestion = a.action_suggestions;
                        actionExactWord = word;
                    }
                });
            });

            objects.forEach(o => {

                var oKeyword = o.object_keywords.split("~");
                oKeyword.forEach(w => {

                    if (w.toLowerCase() == word.toLowerCase()) {
                        console.log("found object match: " + word);
                        objectMatch = o.object_key;
                        console.log("suggestion for action " + o.object_suggestions);
                        objectSuggestion = o.object_suggestions;
                        objectExactWord = word;
                    }

                });
            });

        });

        console.log("My action key is: " + actionMatch);
        console.log("My object key is: " + objectMatch);
        console.log("My action suggestion is: " + actionSuggestion);
        console.log("My object suggestion is: " + objectSuggestion);

        // Determine Function Name based on action key and object key
        var functionMatch = [];
        functionMatch[0] = "undetermined";

        functions.forEach(f => {

            if (f.action_key == actionMatch && f.object_key == objectMatch) {
                functionMatch[0] = f.function_name;
            }

        });

        // Add suggestions based on whichever key is found, if both keys are found but didn't map to function we should prioritize object since that is more descriptive
        if (functionMatch[0] == "undetermined") {

            // If no action key then suggestions are based on object key
            if (actionMatch == "") {
                functionMatch[1] = objectSuggestion;
                functionMatch[2] = objectExactWord;
            }
            // If no object key then suggestions are based on action key
            else if (objectMatch == "") {
                functionMatch[1] = actionSuggestion;
                functionMatch[2] = actionExactWord;
            }
            // If both keys are present then suggestions based object key
            else if (actionMatch != "" && objectMatch != "") {
                functionMatch[1] = objectSuggestion;
                functionMatch[2] = objectExactWord;
            }
        }

        // console.log("functionmatch[0] = " + functionMatch[0]);
        // console.log("functionmatch[1] = " + functionMatch[1]);

        return functionMatch;
    };

    const openVoiceTab = () => {
        var taptargets = document.querySelectorAll('.tap-target');
        var instance = M.TapTarget.getInstance(taptargets[0]);
        instance.open();
    }

    return (
        <div style={{ textAlign: "right" }}>
            <div className="tap-target #bbdefb blue lighten-4" data-target="menu">
                <div className="tap-target-content" >
                    <h5>
                    <span style={{paddingRight:"10px"}}>Voice</span>

                    <a id="startVoiceListener" onClick={SpeechRecognition.startListening}
                        style={{marginRight:"10px"}}
                        className="waves-effect waves-light btn btn-floating #1976d2 blue darken-1"
                    ><i className="material-icons">volume_up</i></a>

                    <a id="startVoiceListener" onClick={SpeechRecognition.stopListening}
                        className="waves-effect waves-light btn btn-floating #1976d2 blue darken-1"
                    ><i className="material-icons">volume_off</i></a>

                    </h5>
                    <p id="instruction">Press the play button to start voice command.</p>

                    <p>
                        <span >Received Input: <b><span id="speechInput">Waiting for speech input...</span></b></span>
                    </p>
                    <div id="suggestionDiv" style={{ textAlign: "left", display: "none" }}>
                        <p id="suggestionIntro"></p>
                        <ul className="collection" id="suggestions"></ul>

                    </div>
                </div>
            </div>

            <a id="menu" className="waves-effect waves-light btn btn-floating #1976d2 blue darken-1" onClick={() => openVoiceTab()} style={{ position: 'fixed', bottom: "20px", right: "20px" }}>
                <i className="material-icons">keyboard_voice</i>
            </a>
        </div>
    )
}

export default VoiceCommand