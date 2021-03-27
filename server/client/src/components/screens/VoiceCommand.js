import React, { Component, useEffect } from "react";
import { Link } from 'react-router-dom';
import M from 'materialize-css';
//import { SpeechParser } from '../speechparser.js';
//import { testSpeech } from '../speechparser.js';

/////////////////////////////////////////////////////////////////////////////
////////////////////////// Load SpeechMappings //////////////////////////////
/////////////////////////////////////////////////////////////////////////////
var actions = [];
var objects = [];
var functions = [];

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        retrieveMappings(this);
    }
};
xmlhttp.open("GET", "mappings/speechmapping.xml", true);
xmlhttp.send();

//Populate variables with speech mapping values
function retrieveMappings(xml) {

    var i, xmlDoc, xmlKey, xmlWord, xmlFName, xmlFAKey, xmlFOKey;

    xmlDoc = xml.responseXML;

    // Build list of Actions
    xmlKey = xmlDoc.getElementsByTagName("ACTION_ACTION_KEY");
    xmlWord = xmlDoc.getElementsByTagName("ACTION_KEYWORDS");

    for (i = 0; i < xmlKey.length; i++) {
        let action = new Action(xmlKey[i].childNodes[0].nodeValue, xmlWord[i].childNodes[0].nodeValue);
        actions.push(action);

    }

    // Build list of Objects
    xmlKey = xmlDoc.getElementsByTagName("OBJECT_OBJECT_KEY");
    xmlWord = xmlDoc.getElementsByTagName("OBJECT_KEYWORDS");

    for (i = 0; i < xmlKey.length; i++) {
        let object = new Object(xmlKey[i].childNodes[0].nodeValue, xmlWord[i].childNodes[0].nodeValue);
        objects.push(object);
    }

    // Build list of Functions
    xmlFName = xmlDoc.getElementsByTagName("FUNCTION_NAME");
    xmlFAKey = xmlDoc.getElementsByTagName("ACTION_KEY");
    xmlFOKey = xmlDoc.getElementsByTagName("OBJECT_KEY");

    for (i = 0; i < xmlFName.length; i++) {
        let func = new Function(xmlFName[i].childNodes[0].nodeValue, xmlFAKey[i].childNodes[0].nodeValue, xmlFOKey[i].childNodes[0].nodeValue);
        functions.push(func);
    }

    console.log(actions);
    console.log(objects);
    console.log(functions);
    console.log("End On Load XML")
}

class Action {
    constructor(action_key, action_keywords) {
        this.action_key = action_key;
        this.action_keywords = action_keywords;
    }
}

class Object {
    constructor(object_key, object_keywords) {
        this.object_key = object_key;
        this.object_keywords = object_keywords;
    }
}

class Function {
    constructor(function_name, action_key, object_key) {
        this.function_name = function_name;
        this.action_key = action_key;
        this.object_key = object_key;
    }
}


/////////////////////////////////////////////////////////////////////////////
////////////////////////// Load Speech Recognition //////////////////////////
/////////////////////////////////////////////////////////////////////////////
try {
    console.log("Load speech recognition");
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
}
catch (e) {
    console.error(e);
}

recognition.continuous = false;



///////////////////////////////////////////////////////////////////////////
////////////////////////// Load Speech Functions //////////////////////////
///////////////////////////////////////////////////////////////////////////
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

    parseSpeechInput.forEach(word => {

        actions.forEach(a => {

            var aKeyword = a.action_keywords.split("~");
            aKeyword.forEach(w => {

                if (w.toLowerCase() == word.toLowerCase()) {
                    console.log("found action match: " + word);
                    actionMatch = a.action_key;
                }
            });
        });

        objects.forEach(o => {

            var oKeyword = o.object_keywords.split("~");
            oKeyword.forEach(w => {

                if (w.toLowerCase() == word.toLowerCase()) {
                    console.log("found object match: " + word);
                    objectMatch = o.object_key;
                }

            });
        });

    });

    console.log("My action key is: " + actionMatch);
    console.log("My object key is: " + objectMatch);


    // Determine Function Name based on action key and object key
    var functionMatch = "";

    functions.forEach(f => {

        if (f.action_key == actionMatch && f.object_key == objectMatch) {
            functionMatch = f.function_name;
        }
    });

    return functionMatch;
};

class SpeechFunction {
    constructor() { }

    executeFunction(function_name) {

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

            default:
                console.log("Did not find function to execute");
        }


    }
}

// Add Speech Functions Below. Try to keep consistent with speechmappings.
function nav_chatrooms() {
    console.log("Execute nav_chatrooms function");

}

function nav_feed() {
    console.log("Execute nav_feed function");
}

function nav_profile() {
    //window.location.href="http://localhost:3000/"
    console.log("Execute nav_profile function");
}

function do_createpost() {
    window.location.href = "http://localhost:3000/createpost";
}


class VoiceCommand extends Component {

    // Required to load after DOM
    componentDidMount() {
        var taptargets = document.querySelectorAll('.tap-target');
        var instances=M.TapTarget.init(taptargets, {});
        instances[0].open();

        // DOM Elements
        var instruction = document.getElementById("instruction");
        var speechInput = document.getElementById("speechInput");

        // This block is called every time the Speech APi captures a line. 
        recognition.onresult = function (event) {

            recognition.stop();
            //recognition.onspeechend();
            // event is a SpeechRecognitionEvent object.
            // It holds all the lines we have captured so far. 
            // We only need the current one.
            var current = event.resultIndex;

            // Get a transcript of what was said.
            var transcript = event.results[current][0].transcript;

            var strTranscript = String(transcript);
            console.log("captured speech: " + strTranscript);
            speechInput.innerText = strTranscript;

            var resultFunction = GetFunctionName(strTranscript);;

            // Execute function
            if (resultFunction != "") {
                console.log("FUNCTION: " + resultFunction);
                let speechFunction = new SpeechFunction();
                speechFunction.executeFunction(resultFunction);

            }
            else {
                console.log("Cannot find a function name");
            }

        };


        recognition.onstart = function () {
            instruction.innerText = "Voice recognition activated. Try speaking into the microphone.";
        }

        recognition.onspeechend = function () {
            instruction.innerText = "Press the play button to start voice command.";
        }

        recognition.onerror = function (event) {
            instruction.innerText = "You were quiet for a while so voice recognition turned itself off.";
        };
    }

    // Custom Functions
    startVoiceListener() {
        recognition.start();
    }
    
    openVoiceTab (){
        var taptargets = document.querySelectorAll('.tap-target');
        var instance = M.TapTarget.getInstance(taptargets[0]);
        instance.open();
    }

    // Render HTML
    render() {
        return (

            // <div className="App" ref={el => (this.div = el)}>
            <div style={{textAlign:"right"}}>
                <div className="tap-target #bbdefb blue lighten-4" data-target="menu">
                    <div className="tap-target-content" >
                        <h5>Voice</h5>
                        <p id="instruction">Press the play button to start voice command.</p>
<<<<<<< Updated upstream
                        <button id="startVoiceListener" onClick={this.startVoiceListener}>Test Speech Mapping</button>
=======
                        <button id="startVoiceListener" onClick={this.startVoiceListener}
                        className="btn waves-effect waves-light #1976d2 blue darken-1"
                        >Start Microphone</button>
>>>>>>> Stashed changes
                        <p>
                            <span >Received Input: <b><span id="speechInput">Waiting for speech input...</span></b></span>
                        </p>
                    </div>
                </div>

                <a id="menu" className="waves-effect waves-light btn btn-floating #1976d2 blue darken-1" onClick={this.openVoiceTab} style={{ position: 'fixed', bottom: "20px", right: "20px" }}>
                    <i className="material-icons">keyboard_voice</i>
                </a>
            </div>
        );
    }
}
export default VoiceCommand;
