const { Server } = require('socket.io');
const server = require('http').createServer();
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

let users = [];
let typingUsers = [];

io.on('connection', (socket)=>{

    socket.on('userId', (data)=>{
        const { _id } = data;
        //ensure that user does not exist before
        users = users.filter(user => user._id !== _id);
        users.push({ _id, socketId: socket.id });
        io.emit('users', users);
        console.log(`client connected, ID - ${socket.id}`);
    })

    socket.on('message', (data)=>{
        const user = users.find(user => user._id === data.receiverId);
        if(user){
            socket.to(user.socketId).emit('message', data);
        }
    })

    socket.on('typing', (data)=>{
        typingUsers.push({ _id: data._id, socketId: socket.id });
        socket.broadcast.emit('typing', typingUsers);
    })

    socket.on('stop-typing', (data)=>{
        typingUsers = typingUsers.filter(user => user._id !== data._id );
        socket.broadcast.emit('typing', typingUsers);
    })

    socket.on('disconnect', ()=>{
        socket.removeAllListeners();

        users = users.filter(user => user.socketId !== socket.id);
        typingUsers = typingUsers.filter(user => user.socketId !== socket.id);
        
        socket.broadcast.emit('users', users);
        console.log(`client disconnected, ID - ${socket.id}`);
    })

});

server.listen(4000, ()=>{
    console.log('socket.io server');
})