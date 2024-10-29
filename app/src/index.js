import express from 'express';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';
import { Filter } from 'bad-words';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createMessage, getUserList, addUser, removeUser, findUser } from './utils/helpers.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new IOServer(server);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

// Hàm gửi tin nhắn

const sendMessage = (io, id, room, messageText, callback) => {
    const filter = new Filter();
    const user = findUser(id);
    if (filter.isProfane(messageText)) {
        return callback('Profanity is not allowed!');
    }

    io.to(room).emit('send message from server to client', createMessage(messageText, user.username));
    callback();
};

// Hàm chia sẻ vị trí
const shareLocation = (io, room, { latitude, longitude }) => {
    const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
    io.to(room).emit('share location from server to client', linkLocation);
};


io.on('connection', (socket) => {

    socket.on('join romm form client to server', ({ room, username }) => {
        socket.join(room);

        // gửi cho client vừa kết nối vào
        socket.emit('send message from server to client', createMessage(`Chào mừng bạn đến với phòng ${room}!`));

        // gửi cho các client còn lại
        socket.broadcast.to(room).emit('send message from server to client', createMessage(`${username} vừa tham gia vào phòng ${room}!`));

        // chat
        socket.on('send message from client to server', (messageText, callback) => {
            const id = socket.id;
            sendMessage(io, id, room, messageText, callback);
        });

        //xử lý location
        socket.on('share location from client to server', ({ latitude, longitude }) => {
            shareLocation(io, room, { latitude, longitude });
        })


        //xử lý add user
        const newUser = {
            id: socket.id,
            username,
            room
        }

        addUser(newUser)
        // Gửi danh sách user cho client
        io.to(room).emit('send user list from server to client', getUserList(room));

    })

    socket.on('disconnect', () => {
        console.log('Client disconnected');

        // Xóa người dùng khỏi danh sách
        const removedUser = removeUser(socket.id);

        if (removedUser) {

            // Gửi thông báo rằng người dùng đã rời phòng
            io.to(removedUser.room).emit('send message from server to client', {
                username: 'Hệ thống',
                messageText: `${removedUser.username} đã rời khỏi phòng.`,
                createdAt: new Date().toLocaleString(),
            });

            // Gửi lại danh sách người dùng mới sau khi xóa
            io.to(removedUser.room).emit('send user list from server to client', getUserList(removedUser.room));
        }
    });
});

const startServer = async () => {
    try {
        server.listen(process.env.PORT, () => {
            console.log(`App server listening on port: http://localhost:${process.env.PORT}`)
        })
    } catch (err) {
        console.error('App server error:', err.stack)
    }
}

startServer()