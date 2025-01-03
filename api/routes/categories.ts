import Category from '../models/category'
import express, {Response, Request} from 'express';
import mongoose from 'mongoose';
import _ from 'lodash';
import User from '../models/user'
const categoryRouter = express.Router();

//api/category
// req: name, image, descripton
// CREATE ONE
categoryRouter.post('/create', async (req:Request, res: Response): Promise<void> => {
  const doesExist = await Category.findOne({ name: req.body.name })
  console.log(doesExist)
  if(doesExist) {
     res.status(403).send('Category already exists')
    return
  }

  const category = new Category(_.assign(_.pick(req.body,
  ['name', 'image', 'description', 'admin']), {_id: new mongoose.Types.ObjectId() }))
  console.log(category);

  category.save();
  res.send(category)

})
 
// req: user_id, category_name
const followCategory = async (req, res) => {
  let user, category
  try { await User.findOne({ _id: req.body.user_id }).then(ele => {user = ele}) } catch  { return res.status(404).send('Cannot find user') }
  try {await Category.findOne({name: req.body.category_name}).then(e=>category=e) } catch  {return res.status(404).send('Category does not exist')}
  const isSubscribed = user.category_subscriptions.findIndex(id => id.equals(category._id))
  if (isSubscribed === -1) {
    user.category_subscriptions.push(category._id)
    console.log(user.category_subscriptions)

    category.followers.push(user._id)
  } else {
    user.category_subscriptions.splice(isSubscribed, 1)
    category.followers.splice(category.followers.findIndex(x=> x === user._id), 1)
  }
  await user.save()
  await category.save()
  // console.log(category)
  return res.send(user)
}
categoryRouter.post('/follow-category', followCategory)




// FIND ALL
categoryRouter.get('/all', async(req:Request, res:Response): Promise<void> => {
  const allCategories = await Category.find({});
  if(!allCategories) {
     res.status(201).send('No categories were found.')
    return
    }

     console.log(allCategories);

 res.send(allCategories)

})

// FIND ONE
categoryRouter.get('/name/:name', async (req:Request, res:Response): Promise<void> => {
  let category
  try { await Category.findOne({ name: req.params.name }).lean().then(e => category = e) 
} catch {
   res.status(404).send('Category not found')
  return
}
   res.send(category)
})
// FIND ONE
categoryRouter.get('/id/:id', async (req: Request, res:Response): Promise<void> => {
  let category
  try { await Category.findOne({ _id: req.params.id }).then(ele => category = ele) }
  catch  { 
     res.status(404).send('Category does not exist') 
    return
  }
 res.send(category)
})


// Change One 
// Can edit name, image, description, admin
categoryRouter.put('/edit', async (req:Request, res:Response): Promise<void> => {
  await Category
  .findOne({
    name: req.body.original_name
  }).then(ele => {
    if (!ele) return res.status(404).send('category not found');
      console.log(ele)
    _.assign(ele, {
      name: req.body.new_name,
      image: req.body.image,
      description: req.body.description,
      admin: req.body.admin
    })
    ele.save();
    res.send(ele);
  })
}
) 


// Delete
categoryRouter.delete('/delete', async (req:Request, res:Response): Promise<void> => {

  res.send(await Category.deleteOne({ name: req.body.name }, {}))
}
)

export default categoryRouter;
