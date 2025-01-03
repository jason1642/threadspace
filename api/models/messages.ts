import mongoose from 'mongoose';
const snakeCaseStamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }};

// This is an individual message that will be pushed into the messages array in the chat object model
  const messageSchema = new mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true
    },
    seen_by_recipient: 
    {
      seen: { type: Boolean, default: false },
      date_seen: {type: Date, default: new Date()}
    },
    text: {
      type: String,
      minlength: 2,
      maxlength: 500
    },
    
  }, snakeCaseStamps)
  
  
  
  export default messageSchema