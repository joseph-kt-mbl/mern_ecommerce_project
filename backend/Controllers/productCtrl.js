const Product = require('../Models/productModel')
const User = require('../Models/userModel')
const slugify = require('slugify')

const asyncHandler = require('express-async-handler');
const {ValidateMongodbID} = require('../utils/ValidateMongodbId');
const cloudinaryUploadImg = require('../utils/cloudinary');
const { default: axios } = require('axios');




const createProduct = asyncHandler(
    async (req,res) =>{
        if(req.body.title){
            req.body.slug = slugify(req.body.title)
        }
        // create new product 
        const newProduct = await Product.create(req.body)
        if(!newProduct){
            res.status(400).json({mssg:"Error on creatinf new Product"})
            throw new Error("Product creation Faild!")
        }
        res.status(200).json(newProduct)

    }
)
const getProduct = asyncHandler(
    async (req,res) => {
        const {id} = req.params
        ValidateMongodbID(id)
        const foundProduct = await Product.findById(id)
        if(!foundProduct){
            throw new Error("Product Not Found!")
        }
        res.status(201).json(foundProduct)
    }
)


const getAllProducts = asyncHandler(async (req, res) => {
    // filtring
    const queryObj = {...req.query}
    const excludeFields = ['page','sort','limit','fields']
    excludeFields.forEach(element => {
        delete queryObj[element]
    });

    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    let query = Product.find(JSON.parse(queryStr))

    // sorting
    if(req.query.sort){
        const sortedBy = req.query.sort.split(",").join(" ")
        query = query.sort(sortedBy)
    }else{
        query = query.sort("-createdAt")
    }
    // limiting the fields
    if(req.query.fields){
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields)
    }else{
        query = query.select('-__v')
    }

    // pagination
    const page = req.query.page
    const limit = req.query.limit
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)

    if(req.query.page){
        const productCount = await Product.countDocuments() 
        if(skip >= productCount) throw new Error("This Page Does Not Exists!")
    }


    const products = await query

    if (products.length === 0) {
        return res.status(404).json({ error: "No products found!" });
    }
    res.status(200).json(products);
});


const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "No ID in the parameters" });
    }
    ValidateMongodbID(id)

    // Optionally create a slug from the title if provided
    if (req.body.title) {
        req.body.slug = slugify(req.body.title);
    }

    // Update the product by ID
    const updatedProduct = await Product.findByIdAndUpdate(
        id, // Use id directly here
        req.body, // The fields to update
        { new: true, runValidators: true } // Options: return the updated document and run validation
    );

    if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
});

const deleteProduct = asyncHandler(
    async (req,res) => {
        const {id} = req.params
        ValidateMongodbID(id)
        const deletedPrd = await Product.findByIdAndDelete(id)
        if(!deleteProduct){
            throw new Error("Deleteing Product Faild")
        }
        res.status(200).json({mssg:`The Product [${id} ${deletedPrd.slug}] was Deleted Successfully`})
    }
)

const rating = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { prdId, rate , comment} = req.body;

    if (!id || !prdId) {
        return res.status(400).json({ message: "Problem in IDs" });
    }

    ValidateMongodbID(id);
    ValidateMongodbID(prdId);

    if (rate > 5 || rate < 1) {
        return res.status(400).json({ message: "Invalid Rating" });
    }

    const product = await Product.findById(prdId);
    if (!product) {
        return res.status(404).json({ message: "No product found with this ID" });
    }

    const newRating = {
        star: rate,
        comment,
        postedby: id
    };

    // Check if the user has already rated the product
    const existingRatingIndex = product.ratings.findIndex(
        (rating) => rating.postedby.toString() === id.toString()
    );

    if (existingRatingIndex !== -1) {
        // Update existing rating
        product.ratings[existingRatingIndex] = newRating
    } else {
        // Add new rating
        product.ratings.push(newRating);
    }

    // Calculate the average rating
    const totalRating = product.ratings.reduce((acc, current) => acc + current.star, 0);
    const averageRating = totalRating / (product.ratings.length * 5);
    product.totalrating = averageRating * 100;

    await product.save();

    // Optionally populate the postedby field
    const populatedProduct = await Product.findById(prdId).populate('ratings.postedby').exec();

    res.status(200).json(populatedProduct);
});


const uploadImages = asyncHandler(
    async (req, res) => {
   

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Problem in IDs" });
        }

        ValidateMongodbID(id);

        const prd = await Product.findById(id);
        if (!prd) {
            throw new Error(`No Product With This ${id}!`);
        }

        try {
            const uploader = (path) => cloudinaryUploadImg(path, 'images');
            const urls = [];
            const files = req.files;

            for (const file of files) {
                const newPath = await uploader(file.path);
                urls.push(newPath.url);
            }

            prd.images = [...prd.images, ...urls];
            await prd.save();

            await axios.get(`http://localhost:${process.env.PORT}/delete-images`);

            res.status(200).json(prd);
        } catch (error) {
            res.status(400).json({ mssg: 'something went wrong!' });
        }
    }
);





module.exports = {
    createProduct,
    getProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    rating,
    uploadImages
}