import Post from '../models/post'
import express, {Request, Response} from 'express';
import Category from '../models/category';
import _ from 'lodash';
import mongoose from 'mongoose';
import User from '../models/user';
import async from 'async'

const postRouter = express.Router();


// api/posts


// post to category
postRouter.post('/create', async (req:Request, res: Response): Promise<void> => {
  // Check if category exists
  // Verify info? check user
  // Add post to categories
  // category instance to push to
  // req: user_id, username, category, images, text, title, 
  let user
  const category = await Category.findOne({ name: req.body.category });
   await User.findOne({ _id: req.body.author.user_id }).then(ele=>{ user = ele})
  console.log(user)
  if (!category || !user) {
   res.status(404).send('Category or User does not exist.')
    return
  }
  const post = new Post(_.assign(
    _.pick(req.body, ['title', 'text', 'category']), {
    author: {
      user_id: req.body.author.user_id,
      username: req.body.author.username,
      profile_image: req.body.author.profile_image
    }, _id: new mongoose.Types.ObjectId(), images: [req.body.images] 
  }))


 category.posts.push({ post_id: post._id, author_id: post.author.user_id });
  user.created_posts.push({ post_id: post._id });
  await category.save()
  await user.save()
  await post.save()
  // console.log(post)  

   res.send(post)

})
  
postRouter.get('/findAll', async (req:Request, res:Response): Promise<void> => {
  try {
    const posts = await Post.find({}).limit(100)
     res.send(posts)
    return
  } catch {
    res.status(404).send('An error has occurred while fetching posts.')
  }
})

// Find one
postRouter.get('/:_id', async (req:Request, res:Response): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params._id)) {
     res.status(400).send('Invalid ID')
    return
  }
  let post
  try { await Post.findOne({ _id: req.params._id }).then(ele => post = ele) } catch {
     res.status(404).send('Cannot find post')
     return
    }
 res.send(post)  

})

// Find all by user ID
postRouter.get('/findAllByUser/:_id', async (req: Request, res:Response): Promise<void> => {
  let posts
  if (!mongoose.isValidObjectId(req.params._id)){
    res.status(400).send('Invalid ID')
    return
  }
  
  try { await User.findOne({ _id: req.params._id }) } catch { 
  res.status(404).send('User not found') 
    return
}
  
  await Post.find({ 'author.user_id': req.params._id }).then(e=>posts=e)
  // if (!posts) return res.status(404).send('Cannot find post.')
  // console.log(posts)
   res.send(posts)
}) 



// Get all posts info from comment array of post ids
// req: commentArray
// Returns array of  comment + post arrays
// Example [[{commentdata}, {potdata}], [{commentdata, postdata}]]
postRouter.post('/getManyPostsByComments', async (req, res) => {

  // 1 - create array of post ids by mapping the array of full comment data
  // 2 - find posts that have the ids, no duplicates
  // 3 - for each comment there initially was, create a new array of arrays consisting
  // of a comment and its corresponding posts and returns it
 return async.waterfall([
   async () => {
     const postIdArray = req.body.commentArray.map(r=>r.post_id)
     const posts = await Post.find({ _id: { $in: postIdArray } }).lean()
     return posts
   },
     (fetchedPosts) => {
       return res.send(req.body.commentArray.map(ele =>
         [ele, fetchedPosts
           .find(e => {
          return e._id.equals(ele.post_id)
       })]))
    }
 ],(error, result)=> {
      console.log(result)
    })




})




// Delete
postRouter.delete('/delete', async (req:Request, res:Response): Promise<void> => {
   res.send(await Post.deleteOne({ name: req.body._id }, {})
  )
})

 

// Find all by category name
postRouter.get('/findAllByCategory/:name', async (req:Request, res:Response): Promise<void> => {
  const query = req.params.name === 'general' ? '' : req.params.name
  let posts
  console.log(query)
  if (query === '') {
    posts = await Post.find({})
  } else {
    posts = await Post.find({category: query})
  }

  if (!posts) {
    res.status(404).send('No posts were found.')
    return
  } 
  
  res.send(posts)
})

// Add like/remove like 
postRouter.post('/like', async (req:Request, res:Response): Promise<void> => {
  let user, post
  try { await User.findOne({ _id: req.body.user_id }).then(ele => { user = ele }) } catch  {
      res.status(404).send('User not found') 
      return
    }
  // console.log('user is found')
  try { await Post.findOne({ _id: req.body.post_id }).then(ele => { post = ele }) } catch{
     res.status(404).send('Post not found.')
     return
    }
  // Type of value in liked_posts array is objects but look like strings, use ele.equals() to compare
  const isAlreadyLiked = user.liked_posts.findIndex(ele => ele.equals(req.body.post_id))
  console.log(isAlreadyLiked)
  if (isAlreadyLiked !== -1) {
    // Remove from liked array from both user & post
    user.liked_posts.splice(isAlreadyLiked, 1)
    post.liked_by.splice(post.liked_by.find(ele=>ele===user._id), 1)
  } else {
    // If it doesnt alrady exists, push user ID to both
    post.liked_by.push(user._id)
    user.liked_posts.push(post._id)
  }
  user.save()
  post.save()

  // console.log(isAlreadyLiked)
  res.send(post.liked_by)
  
})




// Save/Unsave post
postRouter.post('/save', async (req: Request, res:Response): Promise<void> => {
  let user, post
  try { await User.findOne({ _id: req.body.user_id }).then(ele => { user = ele }) } catch  { 
     res.status(404).send('User not found')
     return
    }
  // console.log('user is found')
  try { await Post.findOne({ _id: req.body.post_id }).then(ele => { post = ele }) } catch { 
     res.status(404).send('Post not found.')
     return
    }
  // Type of value in liked_posts array is objects but look like strings, use ele.equals() to compare
  const isAlreadySaved = user.saved_posts.find(ele => ele.equals(req.body.post_id))

  if (isAlreadySaved) {
    // Remove from liked array from both user & post
    user.saved_posts.splice(isAlreadySaved, 1)
    post.saved_by.splice(post.saved_by.find(ele=>ele===user._id), 1)
  } else {
    // If it doesnt alrady exists, push user ID to both
    post.saved_by.push(user._id)
    user.saved_posts.push(post._id)
  }
  user.save()
  post.save()

  res.send(post.saved_by)
  
})



const getManyPostsByIdArray = async (req, res) => {
  let posts
  try { await Post.find({ _id: { $in: req.body.id_array } }).then(e => posts = e) } catch  { 
     res.status(404).send('No posts were found')
     return
     }
  console.log(posts)
  return res.send(posts)

}
postRouter.post('/get-many-posts-by-id-array', getManyPostsByIdArray)


// req params: user id
const getAllSavedByUser = async (req:Request, res:Response): Promise<void> => {
  let savedPostsArray = []
  try {
    await User.findOne({ _id: req.params.id }).then(async ele => {
      await Post.find({_id: {$in: ele.saved_posts}}).lean().then(e=>savedPostsArray=e)
  }) } catch  {
      res.status(404).send('User not foud') 
      return
    }
  
  res.send(savedPostsArray)
}
postRouter.get('/get-all-saved-by-user/:id', getAllSavedByUser)







// Edit post
postRouter.put('/edit', async (req, res) => {
  let post
  try { await Post.findOne({ _id: req.body.post_id }).then(ele => {post = ele}) } catch { res.status(404).send('Post not found.') }
  _.assign(post, {
    title: req.body.title, category: req.body.category, images: req.body.images, text: req.body.text
  })
  post.save()
  res.send(post)
})







// postRouter.post('/remove-unvalidated', async (req, res) => {
  
// })


export default postRouter;  