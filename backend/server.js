const express = require('express')
const mongoose = require('mongoose')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 2048
const bodyParser = require('body-parser')

const authRouter = require('./Routes/authRoute')
const {errorHanlder,notFound} = require('./Middlewares/errorHnalder')

app.use(bodyParser.json())

// USE THE AUTH_ROUTER
app.use('/api/user',authRouter)

app.use(notFound)
app.use(errorHanlder)


// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })