const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    content: { type: String }
})

const messageModel = mongoose.model("Message", messageSchema)

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/messages', async function(req, res){
    res.json(await messageModel.find());
});  

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("chat message", async (data) => {

        const newMessage = new messageModel({ content: `${data.nickname}: ${data.message}` });
        await newMessage.save();
    

        io.emit("chat message", { 
            nickname: data.nickname, 
            message: data.message 
        });
    });
    

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, async function(){
    await mongoose.connect("mongodb+srv://erinpan:helloworld@cluster0.l0btntv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log('listening on *:3000');
  });
