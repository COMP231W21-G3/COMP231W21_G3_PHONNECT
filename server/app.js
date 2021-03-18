const express=require('express');
const app=express();
const PORT=process.env.PORT||5000;
var cors = require('cors')

app.use(express.json());

app.use(cors());
app.options('*', cors());

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

