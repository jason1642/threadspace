import mongoose from 'mongoose';
import validator from 'validator';
import commentSchema from './comment'
import chatSchema from './chat';
const snakeCaseStamps = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at' 
  }};

const User = mongoose.model('User', new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 24,
    validate: [validator.isAlphanumeric, 'Usernames may only have letters and numbers.']
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 32,
    unique: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Enter a password'],
    minlength: 5,
    maxlength: 255
  },
  profile_image: {
    type: String
  },
  bio: {
    type: String,
    minlength: 0,
    maxlength: 300,
    default: ''
  },
  active: { type: Boolean, default: false }, 
  last_online: {type: Date,},
  category_subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  created_posts: [{ post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' } }],
  liked_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }],
  liked_comments: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }]
  },
  created_comments: { type: [commentSchema], default: [] },
  saved_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }],
  private_messages: { type: [chatSchema], default: [] },
  // posts: {
  preferences: {
    type: {
      dark_mode: { type: Boolean, default: false },
      avatar_color: {type: String, default: '#3174e8'},
    },
    default: {
      preferences: {
        dark_mode: false,
        avatar_color: 'blue'
      }
    },
    _id: false
  }
  // }
  // comments: [{typ}]
}, snakeCaseStamps));


// Implement last_online, active, preferences: avatar_color


export default User;