import mongoose from 'mongoose';
import commentSchema from './comment'
const snakeCaseStamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};



const Post = mongoose.model('Post', new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  author: { 
    type: {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
      username: { type: String, required: true },
      profile_image: { type: String }
    },
    required: true
  },
  title: { type: String, minlength: 5, maxlength: 100,
    required: true },
  text: { type: String, minlength: 2, maxlength: 400,
    required: true },
  comments: {
    type: [commentSchema]
  },
  category: { type: String, trim: true,
    required: true},
  images: {
    type: [{
      type:
        String, 
      maxItems: 8
    }]
  },
  likes_count: { type: Number, default: 0 },
  liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  saved_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
}, snakeCaseStamps))


export default Post;