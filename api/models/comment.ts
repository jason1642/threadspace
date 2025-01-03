import mongoose from 'mongoose';

const snakeCaseStamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }};

// const replySchema = new mongoose.Schema({
//   author: { type: String, ref: 'Users' },
//   username: { type: String },
//   text: {type: String, minlength: 1, maxlength: 200}
// }, snakeCaseStamps)

const commentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  author: {
    type: {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      username: { type: String },
      profile_image: { type: String }
    },
    _id: false
  },
  text: {
    type: String,
    minlength: 2,
    maxlength: 330
  },
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
  liked_by:[{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
  replies: {
    type: [this],
    default: []
  }
}, snakeCaseStamps)



export default commentSchema