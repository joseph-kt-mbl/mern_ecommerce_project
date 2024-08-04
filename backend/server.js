const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const authRouter = require('./Routes/authRoute');
const productRouter = require('./Routes/productRoute');
const blogRouter = require('./Routes/blogRoute');
const blogCategoryRouter = require('./Routes/blogCatRoute');
const productCategoryRouter = require('./Routes/prodcategoryRoute');
const brandRouter = require('./Routes/brandRoute')
const couponRouter = require('./Routes/couponRoute')
const colorRouter = require("./Routes/colorRoute");
const enqRouter = require("./Routes/enqRoute");
const uploadRouter = require("./Routes/uploadRoute");


const { errorHandler, notFound } = require('./Middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 2048;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

const path = require('path');

const emptyImagesDirectory = require('./utils/removeAllFiles')


const dir = path.join(__dirname,"/public/images/")

app.get('/delete-images',(req,res) => {
  emptyImagesDirectory(dir)
  res.json({mssg:`Directory ${path.join(__dirname,"/public/images/")} is Empty`})
})


// USE THE AUTH_ROUTER
app.use('/api/user', authRouter);

// USE THE BRAND ROUTER
app.use('/api/brand',brandRouter)

// USE THE BLOG-CATEGORY ROUTER
app.use('/api/blog-category', blogCategoryRouter);

// USE THE PRODUCT-CATEGORY ROUTER
app.use('/api/product-category', productCategoryRouter);

// USE THE COUPON ROUTER
app.use('/api/coupon',couponRouter)

// USE THE PRODUCT_ROUTER
app.use('/api/product', productRouter);

// USE THE BLOG ROUTER
app.use('/api/blog', blogRouter);

// USE THE COLOR ROUTER
app.use("/api/color", colorRouter);

// USE THE ENQUITY ROUTER
app.use("/api/enquiry", enqRouter);

// USE THE UPLOAD ROUTER
app.use("/api/upload", uploadRouter);

app.use(notFound);
app.use(errorHandler);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log('connected to db & listening on port', PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
