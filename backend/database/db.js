const mongoose = require('mongoose');

const connect = async()=>{
    try{
        await mongoose.connect('mongodb://localhost:27017/whatsapp_clone');
        console.log('database connected');
    }catch(err){
        console.log(err.message);
    }
}
module.exports = connect;