const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    }],
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ["media", "text"], required: true },
    content: { type: String },
    file: { 
        name: { type: String },
        size: { type: Number },
        url: { type: String },
        extension: { type: String }
    }
}, { timestamps: true });

const Message = mongoose.model('Message', schema);
module.exports = Message;