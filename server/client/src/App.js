import React, { useEffect, createContext, useReducer, useContext } from 'react';
import NavBar from './components/Navbar';
import "./App.css";
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';
import CreatePost from './components/screens/CreatePost';
import VoiceCommand from './components/screens/VoiceCommand';
import Chatrooms from './components/screens/Chatrooms';

export const UserContext = createContext();
export const SocketContext=createContext();

const Routing = () => {
  return (
    <Switch>
     
      <Route path="/createpost">
        <CreatePost />
      </Route>
      <Route path="/voicecommand">
        <VoiceCommand />
      </Route>
      <Route path="/chatrooms">
        <Chatrooms/>
      </Route>
    </Switch>
  )
}

function App() {
  return (
    <UserContext.Provider>
      <SocketContext.Provider>
      <BrowserRouter>
        <NavBar />
        <Routing />
      </BrowserRouter>
      </SocketContext.Provider>
    </UserContext.Provider>


  );
}

export default App;
