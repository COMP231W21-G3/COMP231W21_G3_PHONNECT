const express=require('express');
const app=express();
const mongoose=require('mongoose');
const {MONGOURI}=require('./config/keys');
const {JWT_SECRET}=require('./config/keys');
const PORT=process.env.PORT||5000;
const socket=require('socket.io');
const socketioJwt = require('socketio-jwt');
var cors = require('cors')

require('./models/user');
require('./models/post');
require('./models/chatroom');
require('./models/chat');
require('./models/servicerequest');

app.use(express.json());
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));
app.use(require('./routes/chatroom'));
app.use(require('./routes/servicerequest'));

app.use(cors());
app.options('*', cors());

mongoose.connect(MONGOURI,{useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology: true,useFindAndModify: false}).catch(error => handleError(error));
mongoose.connection.on('connected',()=>{
    console.log('connected to mongo');
});
mongoose.connection.on('error',(err)=>{
    console.log('error connecting to mongo',err);
});

if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'));
    const path=require('path');
    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'));
    })
}

var server=app.listen(PORT,()=>{
    console.log('server is running on',PORT);
})

//socket setup
var io=socket(server);

io.use(socketioJwt.authorize({
    secret: JWT_SECRET,
    handshake: true
  }));
   
  io.on('connection', (socket) => {    
    console.log('made socket connection',socket.id);
    require('./routes/chatroom').createChatroomLive(socket, io);
    require('./routes/chatroom').openChatroomLive(socket, io);
    require('./routes/chatroom').addChatLive(socket, io);
    require('./routes/chatroom').addParticipantsLive(socket, io);
    require('./routes/chatroom').removeParticipantLive(socket, io);
    require('./routes/chatroom').openVideoChatRoomLive(socket, io);
    require('./routes/chatroom').closeVideoChatRoomLive(socket, io);

    return io;    
  });