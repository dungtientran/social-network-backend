const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require('dotenv');
const cors = require('cors');
const socket = require('socket.io')

dotenv.config();

const userRouter = require('./src/routes/UserRouter');
const postRouter = require('./src/routes/PostRouter');
const messengerRouter = require('./src/routes/Messenger');
const allMessengerRouter = require('./src/routes/MessengerChatAll');

mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log('Connect Db success!')
    })
    .catch((err) => {
        console.log(err)
    })

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/messenger', messengerRouter);
app.use('/api/messengerall', allMessengerRouter);

const port = process.env.PORT || 3001
const server = app.listen(port, () => {
    console.log('Server is running in port: ', + port)
})

const io = socket(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        // credentials: true,
    },
});

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log('socken on ' + socket.id);
    socket.on('addUser', (userId) => {
        !onlineUsers.some(user => user === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id
            });
        io.emit('getOnlineUser', onlineUsers);
    })
    socket.on('disconnet', () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit('getOnlineUser', onlineUsers);
    })
    socket.on('sendMessenger', (msg) => {
        const recieveUsers = onlineUsers.filter(user => user.userId !== msg.user.id)
        // console.log(recieveUsers);
        recieveUsers.map(recieveUser => {
            io.to(recieveUser.socketId).emit('msg-recieve', msg);
        })
    })
});



