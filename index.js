const express =require("express");
const app=express();
const path=require('path');
const http=require("http");
const server=http.createServer(app);
const socketio=require('socket.io');
const io=socketio(server);
const moment = require('moment');
const formatMessage = require("./files/chats");
const mongoose=require("mongoose");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
  } = require("./files/users");

app.use(express.json());
const url="mongodb://localhost:27017/practice-mongo";
mongoose.connect(url,{})
.then(result=>console.log("database connected"))
.catch(err=>console.log(err));

const userModel=require("./models/users");
const detailModel=require("./models/details");

app.get("/getusers",async(req,res)=>{
    const userData=await userModel.find();
    res.json(userData);

});
app.get("/getusers/:id",async(req,res)=>{
    try{
        const userData=await userModel.find({id:req.params.id});
        res.json(userData);
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
app.post("/getusers",async(req,res)=>{
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const userExist = await userModel.findOne({ name });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        } else {
            const userData = new userModel({ name });
            const savedUser = await userData.save();
            return res.status(200).json(savedUser);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})
app.get("/getdetails",async(req,res)=>{
   // res.send("get req successful");
    const details=await detailModel.find();
    res.json(details);
});


//  const cors = require('cors');
//app.use(cors());

//emit-->sending an event to all the connected clients
//Sends a specific event (event) along with optional data (data) to the other party (server or client).
//on-->listens to the events sent from server to client
//Listens for a specific event (event) sent from the other party (server or client).
//When the specified event occurs, the provided callback function is executed.

 
//set static folder
app.use(express.static(path.join(__dirname,'../client')));


//run when a client connects
io.on('connection',socket=>{

console.log("new client connected");

//runs when new user join the room 
socket.on('join-room',({username,room})=>{

    const user=userJoin(socket.id,username,room);
    socket.join(user.room);

//welocme current user
socket.emit('message',formatMessage(user.username,`welcome to ${user.room}`));

//broadcast when user connects:
socket.broadcast
.to(user.room)
.emit('message',formatMessage(user.username,`${user.username} joined the ${user.room}`));
 
//send users and room info
io.to(user.room).emit('roomUsers',{
    room:user.room,
    users:getRoomUsers(user.room)
});


//we want to catch the emitted chat-message from client
socket.on('chatMessage',(msg)=>{
    io.to(user.room).emit('message',formatMessage(user.username,msg));
})


//runs when client disconnects
socket.on('disconnect',()=>{
    const user=userLeave(socket.id);
    if(user){

    io.to(user.room).emit('message',formatMessage(user.username,`${user.username} left the chat`));

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
})

});


})

const PORT=5000 || process.env.PORT;
server.listen(PORT,()=>{
    console.log(`server running on port : ${PORT}`)
    //variable syntax
});
