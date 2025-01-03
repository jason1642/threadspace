import mongoose from 'mongoose'
import messageSchema from './messages'
const snakeCaseStamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }};
// This is an instance of a chat with another user. Any message sent to a user will be inserted to their respective
// imbedded document. Upon sending a first message, a new object will be created for all future messages.
// Messages can be deleted but these instances stay forever.
//  USER: {
//    _id: 12301rjwq,
//    ...,
//    private_messages: [ {
//      _id: 1i23emwqladk,
//      recipient: anotherusers_id
//      sender: 12301rjwq,
//      messages: [ {_id: 12oeqwmp, sender: 12301rjwq, text: 'hey whats up'}, ...]
//      created_at: ...,
//      updated_at: ...
//      
//    }]
// 
// 
// }
// 
const chatSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  blocked: {
    type: Boolean,
    default: false
  },
  messages: {type: [messageSchema], default: []}
}, snakeCaseStamps)

export default chatSchema;