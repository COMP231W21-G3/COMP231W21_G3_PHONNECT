import React, { useEffect, createContext, useReducer, useContext } from 'react';
import NavBar from './components/Navbar';
import "./App.css";
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';
import Home from './components/screens/Home';
import Profile from './components/screens/Profile';
import Signin from './components/screens/Signin';
import Signup from './components/screens/Signup';
import CreatePost from './components/screens/CreatePost';
import UserProfile from './components/screens/UserProfile';
import { reducer, initialState } from './reducers/userReducer';
import { socketReducer, socketInitialState } from './reducers/socketReducer';
import AllPosts from './components/screens/AllPosts';
import Post from './components/screens/Post';
import ResetPassword from './components/screens/ResetPassword';
import NewPassword from './components/screens/NewPassword';
import Chatrooms from './components/screens/Chatrooms';
import JitsiRoom from './components/screens/JitsiRoom';
import VoiceCommand from './components/VoiceCommand';
import EditPost from './components/screens/EditPost';
import EditAccountSettings from './components/screens/EditAccountSettings';
import CreateServiceRequest from './components/screens/CreateServiceRequest';

export const UserContext = createContext();
export const SocketContext=createContext();

const Routing = () => {
  const history = useHistory();
  const { state, dispatch } = useContext(UserContext);
  const {socketState:socket,socketDispatch } = useContext(SocketContext);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const jwt = localStorage.getItem("jwt");

    if (user&&jwt) {
      dispatch({ type: "USER", payload: user });
      socketDispatch({ type: "SOCKET_JWT", payload: jwt });

    } else {
      if(!history.location.pathname.startsWith('/resetpassword')
      &&!history.location.pathname.startsWith('/signup'))
      history.push('/signin');
    }
  }, [])

  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/signin">
        <Signin />
      </Route>
      <Route path="/signup">
        <Signup />
      </Route>
      <Route path="/createpost">
        <CreatePost />
      </Route>
      <Route exact path="/profile">
        <Profile />
      </Route>
      <Route path="/profile/:username">
        <UserProfile />
      </Route>
      <Route path="/allposts">
        <AllPosts/>
      </Route>
      <Route path="/post/:postId">
        <Post/>
      </Route>
      <Route exact path="/resetpassword">
        <ResetPassword/>
      </Route>
      <Route path="/resetpassword/:token">
        <NewPassword/>
      </Route>
      <Route path="/chatrooms">
        <Chatrooms/>
      </Route>
      <Route path="/videocall/:roomId">
        <JitsiRoom/>
      </Route>
      <Route path="/editpost/:postId">
        <EditPost/>
      </Route>
      <Route path="/editaccountsettings">
        <EditAccountSettings/>
      </Route>
      <Route path="/createservicerequest">
        <CreateServiceRequest/>
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
