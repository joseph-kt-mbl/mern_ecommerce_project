const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')

const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 2048
const bodyParser = require('body-parser')

const authRouter = require('./Routes/authRoute')
const productRouter = require('./Routes/productRoute')
const blogRouter = require('./Routes/blogRoute')


const {errorHanlder,notFound} = require('./Middlewares/errorHnalder')
const cookieParser = require('cookie-parser')
const { getProductBySlug } = require('./Controllers/productCtrl')


app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(cookieParser())


// USE THE AUTH_ROUTER
app.use('/api/user',authRouter)

// USE THE PRODUCT_ROUTER
app.use('/api/product',productRouter)

// USE THE BLOG ROUTER
app.use('/api/blog',blogRouter)

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