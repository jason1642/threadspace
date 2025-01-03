// can have over 100 Categories
// This model will list number of subscribers and posts associated with it

import mongoose from "mongoose";
const opts = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};
const Category = mongoose.model('Category', new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: { type: String, required: true},
  image: String,
  admin: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
  description: {type: String, minlength: 4, maxlength: 340, required: false},
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  posts: [{ 
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
    author_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    created_at: {type: Date, default: new Date()}
   }],
  
},opts))


export default Category;