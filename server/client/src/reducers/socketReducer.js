import io from 'socket.io-client';

export const socketInitialState=null;

export const socketReducer=(socketState,action)=>{
    if(action.type==="SOCKET_JWT"){
        return io.connect({
            query: `token=${action.payload}`
          });
    }
    if(action.type==="CLEAR_SOCKET_JWT"){
        return null;
    }
    return socketState;
} 

