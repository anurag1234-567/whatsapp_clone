const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const connect = require('./database/db');
const User = require('./models/user');
const Message = require('./models/messages');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect();

app.get('/', (req, res)=>{
    res.send('hello from server');
})

app.get('/users', async(req, res)=>{
    try{
        const users = await User.find({});
        res.json(users);
    }catch(err){
        res.status(500).json(err.message);
        console.log(err);
    }
})

app.post('/user', async(req, res)=>{
    try{
        const { _id } = req.body;
        if(!_id) return res.status(400).send('Required parametes are not sent!');

        const user = await User.findById(_id);
        res.json(user);
    }catch(err){
        res.status(500)
    }
})

app.post('/login', async(req, res)=>{
    try{
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if(!user) return res.status(404).send('Invalid email or password');

        const matchPassword = await bcrypt.compare(password, user.password);
        if(!matchPassword) return res.status(404).send('Invalid email or password');

        const result = { _id: user._id, userName: user.userName };
        res.json(result);
    }catch(err){
        res.status(500).send(err);
        console.log(err);
    }
})

app.post('/register', async(req, res)=>{
    try{
        let { userName, email, password, profileURL, about } = req.body;
        if(!userName || !email || !password) return res.status(400).send('Required parameters are not sent');

        const exist = await User.findOne({ email });
        if(exist) return res.status(400).send('This email is already in use!');

        const hashedPassword = await bcrypt.hash(password, 10);
        if(!profileURL) profileURL = 'profile-icon.svg';
        if(!about) about = 'Hey! I am using web whatsapp.';

        const user = new User({ userName, email, password: hashedPassword, profileURL, about });
        await user.save();
        res.send('user registered successfully');
    }catch(err){
        res.status(500).send(err);
        console.log(err);
    }
})

app.post('/edit-profile', async(req, res)=>{
    try{
        const { _id } = req.body;

        const updatedUser = await User.findByIdAndUpdate(_id, req.body, { new: true });
        res.send(updatedUser);
    }catch(err){
        res.status(500).send(err);
        console.log(err.message);
    }
})

app.post('/save-message', async(req, res)=>{
    try{
        const { senderId, receiverId, content } = req.body;
        if(senderId === '' || receiverId === '' || content.trim() === '') return res.status(400).send('Required paramters are not sent');

        const message = new Message({ participants: [senderId, receiverId], senderId, receiverId, type: "text", content });
        const result = await message.save();

        res.send(result);
    }catch(err){
        res.status(500).send(err);
        console.log(err.message);
    }
})

app.post('/save-media', async(req, res)=>{
    try{
        const { senderId, receiverId, name, size, url } = req.body;
        const array = name.split('.');
        const extension = array[array.length - 1];

        const file = { name, size, url, extension};
        const message = new Message({ participants: [senderId, receiverId], senderId, receiverId, type: "media", file });
        
        const result = await message.save();
        res.send(result);
        console.log(result);
    }catch(err){
        res.status(500).send(err);
        console.log(err);
    }
})

app.post('/get-messages', async(req, res)=>{
    try{
        const { userId, otherUserId } = req.body;
        if(userId === '' || otherUserId === '' ) return res.status(400).send('Required paramters are not sent');

        const messages = await Message.find({
            participants: { $all: [userId, otherUserId] }
        }).sort({ createdAt: -1 }).limit(100);

        res.send(messages);
    }catch(err){
        res.status(500).send(err);
        console.log(err.message);
    }
})


app.listen(8000, ()=>{
    console.log('server running');
})