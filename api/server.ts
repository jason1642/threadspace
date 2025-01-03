import express from 'express'
import app from './app'
import path from 'path'
import db from './database'
const port = process.env.NODE_ENV || 3004


db.connect()







if (process.env.NODE_ENV === "production") {
    app.use(express.static("../build"));
  
    app.get('/*', (req, res) => {
    console.log(path)
    console.log('path!!!!')
      console.log(__dirname)
      console.log(__filename)
      
    res.sendFile(path.join(__dirname, '../build/index.html'), (err) => {
      if (err) {
        res.status(500).send(__dirname)
      }
    })
  })
  }


// const server =
 app.listen(port, ()=> console.log('listening on port ' + port))

