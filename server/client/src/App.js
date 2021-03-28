import React, { useEffect, createContext, useReducer, useContext } from 'react';
import NavBar from './components/Navbar';
import "./App.css";
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';
import CreatePost from './components/screens/CreatePost';
import VoiceCommand from './components/screens/VoiceCommand';
import Chatrooms from './components/screens/Chatrooms';
import MeetAStranger from './components/screens/MeetAStranger';
import UserProfile from './components/screens/UserProfile';
import { reducer, initialState } from './reducers/userReducer';
import { socketReducer, socketInitialState } from './reducers/socketReducer';

export const UserContext = createContext();
export const SocketContext=createContext();

const Routing = () => {
  return (
    <Switch>
     
      <Route path="/createpost">
        <CreatePost />
      </Route>
      <Route path="/chatrooms">
        <Chatrooms/>
      </Route>
      <Route path="/meetastranger">
        <MeetAStranger/>
      </Route>
      <Route path="/userprofile">
        <UserProfile/>
      </Route>
    </Switch>
  )
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [socketState, socketDispatch] = useReducer(socketReducer, socketInitialState);
  
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <SocketContext.Provider value={{ socketState, socketDispatch }}>
      <BrowserRouter>
        <NavBar />
        <VoiceCommand/>
        <Routing />
      </BrowserRouter>
      </SocketContext.Provider>
    </UserContext.Provider>


  );
}

export default App;
