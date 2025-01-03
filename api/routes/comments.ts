import Post from '../models/post.js'
import express from 'express'
import _ from 'lodash'
import mongoose from 'mongoose'
import User from '../models/user.mjs'

const commentRouter = express.Router()
//  /api/comment


// Create a comment on a post
// req: post_id, user_id, author, text
// author { user_id, username, profile_image}
// Save comment data to post and user as an embedded document
commentRouter.post('/post', async (req, res, next) => {
  let post, user, comment
  await Post.findOne({ _id: req.body.post_id }).then(ele=>post=ele)
  await User.findOne({ _id: req.body.user_id }).then(ele=>user=ele)
  if (!post || !user) return res.status(404).send('Post not found.')
  comment = _.assign(_.pick(req.body, ['author', 'text', 'post_id',]), {_id: new mongoose.Types.ObjectId()})
  console.log(comment)
  user.created_comments.push(comment)
  post.comments.push(comment)

  await user.save()
  await post.save()
  res.send(post) 
 
}) 





// Get all comments from a user by id
const getUserComments = async (req, res) => {
  let user
  try { await User.findOne({ _id: req.params.id }).then(e => user = e) } catch (err) { return res.status(404).send('User not found.') }
  res.send(user.created_comments)
}
commentRouter.get('/findAllByUserId/:id', getUserComments)






// req: post_id, user_id, comment_id, 
const likeComment = async (req, res) => {
  let user, post

  try { await User.findOne({ _id: req.body.user_id }).then(ele => { user = ele }) } catch (err) { return res.status(404).send('User not found') }
  // console.log('user is found')
  try { await Post.findOne({ _id: req.body.post_id }).then(ele => { post = ele }) } catch(err){return res.status(404).send('Post not found.')}
  // Type of value in liked_posts array is objects but look like strings, use ele.equals() to compare
  const commentIndex = post.comments.findIndex(e => e._id.equals(req.body.comment_id))
  console.log(commentIndex)
  if(commentIndex === -1) return res.status(404).send('Cannot find comment') 
  const isAlreadyLiked = user.liked_comments.findIndex(ele =>ele.equals(req.body.comment_id))
  if (isAlreadyLiked !== -1) {
    console.log(isAlreadyLiked) 

    // Remove from liked array from both user & post
    user.liked_comments.splice(isAlreadyLiked, 1)
    post.comments[commentIndex].liked_by.splice(post.comments[commentIndex].liked_by.find(ele=>ele===user._id), 1)
  } else {
    // If it doesnt alrady exists, push user ID to both
    post.comments[commentIndex].liked_by.push(user._id)
    user.liked_comments.push(req.body.comment_id)
  }
  user.save()
  post.save()

  // console.log(isAlreadyLiked)
  res.send(post.comments[commentIndex].liked_by)


}
commentRouter.post('/like', likeComment)

// Create a reply comment to a comment 
// Replies can have endless comments, but not sure how that would work on a deeper level
// Atm only one level deep comments
commentRouter.post('/replyToComment', async (req, res, next) => {
  let post, user, comment, targetComment
  await Post.findOne({ _id: req.body.post_id })
    .then(async ele => {
      post = ele
      if (ele) targetComment = ele.comments.findIndex(e =>e._id.equals(req.body.target_comment_id))
    })
  await User.findOne({ _id: req.body.user_id }).then(ele => user = ele)
  if (!post || !user || targetComment !== -1) return res.status(404).send('Post, user, or comment not found.')
  comment = _.assign(_.pick(req.body, ['author', 'text', 'post_id',]), {_id: new mongoose.Types.ObjectId()})
  post.comments[targetComment].replies.push(comment)
  post.save()
  res.send('post')
})


// Delete
// Need req: post_id, comment_id, and verify middleware to verify either post author or comment author
commentRouter.delete('/delete', async (req, res, next) => {
  let post
  await Post.findOne({ _id: req.body.post_id }).then(ele => post = ele)
  if (!post) return res.status(404).send('Post not found.')
  const commentIndex = post.comments.findIndex(e => e._id.equals(req.body.comment_id))
  if (commentIndex === -1) return res.status(404).send('Comment not found.')
  
  post.comments.splice(commentIndex, 1)
  await post.save()
  res.send(post)
})

// Edit comment - only text
commentRouter.put('/edit', async (req, res, next) => {
  let post, commentIndex
  await Post.findOne({ _id: req.body.post_id }).then(ele => post = ele)
  if (!post) return res.status(404).send('Cannot find post')
  commentIndex = post.comments.findIndex(e => e._id.equals(req.body.comment_id))
  if (commentIndex === -1) return res.status(404).send('Comment not found.')
  post.comments[commentIndex].text = req.body.text
  await post.save()
  res.send(post.comments[commentIndex])
})

export default commentRouter