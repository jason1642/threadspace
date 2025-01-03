import User from '../models/user.mjs'
import express from 'express'
import mongoose from 'mongoose'
import {io} from '../server.mjs'
import _ from 'lodash'

const messageRouter = express.Router()


console.log()
class chatClass {
  constructor(sender_id, recipient_id, object_id) {
    this._id = object_id;
    this.sender = sender_id;
    this.recipient = recipient_id;
    this.messages = []
  }
}
// /api/messages/send-private-message/
// req: user_id, recipient_id, message, 
const sendPrivateMessage = async (req, res) => {
  let sender, recipient
  try {await User.findOne({_id: req.body.user_id}).then(e=>sender=e) } catch(err) {res.status(404).send('Cannot find sender user')}
  try {await User.findOne({_id: req.body.recipient_id}).then(c=>recipient=c) } catch(err) {res.status(404).send('Cannot find recipient user')}
  

  // Since the private_messages value is new to the user document model, it will initialize a new property if one doesn't already exist
  // If the private_messages property does exist but a chat has never been initialized with the sender and recipient before, initialize a new chat 
  // console.log(sender.private_messages.find(c => c.recipient.equals(recipient._id)))
  if (sender.private_messages === undefined) {
    sender.private_messages = [new chatClass(sender._id, recipient._id, new mongoose.Types.ObjectId())]
  } else if (sender.private_messages.find(c => c.recipient.equals(recipient._id)) === undefined) {
    sender.private_messages.push(new chatClass(sender._id, recipient._id, new mongoose.Types.ObjectId()))
  }
  // console.log(recipient.private_messages.find(x=>x.recipient.equals(sender._id)))
  if (recipient.private_messages === undefined) {
    recipient.private_messages = [new chatClass(recipient._id, sender._id, new mongoose.Types.ObjectId())]
  } else if (recipient.private_messages.find(x=>x.recipient.equals(sender._id)) === undefined) {
    recipient.private_messages.push(new chatClass(recipient._id, sender._id, new mongoose.Types.ObjectId()))
  }



// Looks for the index of the object inside the private_messages property that contains their respective recipients _id 
// After finding index, push a message to the chat object within the respective private_messages array 
  const newMessage = {
    _id: new mongoose.Types.ObjectId(),
    sender: sender._id,
    recipient: recipient._id,
    text: req.body.message,
    created_at: new Date()
  }
   
  const senderChatIndex = sender.private_messages.findIndex(e=>e.recipient.equals(recipient._id))
  const recipientChatIndex = recipient.private_messages.findIndex(v=>v.recipient.equals(sender._id))

  sender.private_messages[senderChatIndex].messages.push(newMessage)
  recipient.private_messages[recipientChatIndex].messages.push(newMessage)

  await sender.save()
  await recipient.save()
  console.log(sender)
  io.emit(recipient._id, {content: newMessage ,from: sender._id})

  return res.send(newMessage)


}

messageRouter.post('/send-private-message', sendPrivateMessage)


const getActiveChatsInfo = async (req, res, next) => {
  let user, infoArray
  try{ await User.findOne({_id: req.params.id}).lean().then(r=> user = r) } catch (err) {return res.status(404).send('User not found.')}
  // console.log(user)
  try { await User.find({ _id: { $in: user.private_messages.map(c => c.recipient) } }).lean().select('username bio email active preferences private_messages created_at updated_at').then(x => infoArray = x) } catch (err) { return res.status(404).send('No private messages were found.')}
  // console.log(infoArray)
  return res.send(infoArray)
}

messageRouter.get('/:id', getActiveChatsInfo)


// req: user_id, recipient_id
// Assumes recipient is already in users chat list
const getMessageHistory = async (req, res) => {
  let messagesObj
    // console.log(req.body.user_id)

  try {
    await User.findOne({ _id: req.body.user_id }).lean().select('private_messages').then(ele => {
      // console.log(ele.private_messages[0])
      messagesObj = ele.private_messages.find(obj => obj.recipient.equals(req.body.recipient_id))
  // return res.send(messagesObj)

    }).then(async e => {
      await User.findOne({ _id: req.body.recipient_id }).lean().select('username bio email').then(r => {
        messagesObj = _.assign(messagesObj, r)
        // console.log(messagesObj)
        return res.send(messagesObj)
      } )
    })
  } catch (err) {
    console.log(err)
    return res.status(404).send('No messages found.')
  }


} 
messageRouter.post('/history', getMessageHistory)

const readMessages = async (req, res) => {
  
  let user, recipientUser
  try {
    await User.findOne({ _id: req.body.user_id }).then(r => {
      
      user = r
      const currentChat = user.private_messages.find(x => x.recipient.equals(req.body.recipient_id))
      console.log(req.body.recipient_id)
      currentChat.messages.forEach((c, ind) => {
        if (!c.seen_by_recipient) {
          currentChat.messages[ind].seen_by_recipient = {
            seen: currentChat.messages.recipient.equals(req.body.user_id) ? true : false,
            date_seen: new Date()
          }
          return
        }
        if (c.seen_by_recipient.seen === false && c.recipient.equals(req.body.user_id)) {
          currentChat.messages[ind].seen_by_recipient.seen = true;
        currentChat.messages[ind].seen_by_recipient.date_seen = new Date()
        }
        
      })
    })
  } catch (err) {
    console.log(err)
    return res.status(404).send(err)
  }
  try {
    console.log(req.body.recipient_id)
    await User.findOne({ _id: req.body.recipient_id }).then(u => {
      recipientUser = u
      const recipientCurrentChat = u.private_messages.find(v => v.recipient.equals(req.body.user_id))
      
      recipientCurrentChat.messages.forEach((b, i) => {
        if (b.seen_by_recipient === undefined) {
          recipientCurrentChat.messages[i].seen_by_recipient = {
            seen: recipientCurrentChat.messages.recipient.equals(req.body.user_id) ? true : false,
            date_seen: new Date()
          }
          return
        }
        if (b.seen_by_recipient.seen === false && b.recipient.equals(req.body.user_id)) {
          recipientCurrentChat.messages[i].seen_by_recipient.seen = true
          recipientCurrentChat.messages[i].seen_by_recipient.date_seen = new Date()

        }
      })
    })
  } catch (err) {
    console.log('ERROR')
    return res.status(404).send(err)
  }
  await user.save()
  await recipientUser.save()
  return res.send(user)
}
messageRouter.post('/read-messages', readMessages)


export default messageRouter;

