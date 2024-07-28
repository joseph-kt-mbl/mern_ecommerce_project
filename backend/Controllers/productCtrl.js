const Product = require('../Models/productModel')
const slugify = require('slugify')

const asyncHandler = require('express-async-handler');


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
        const foundProduct = await Product.findById(id)
        if(!foundProduct){
            throw new Error("Product Not Found!")
        }
        res.status(201).json(foundProduct)
    }
)

// const getProductBySlug = asyncHandler(
//     async (req,res) => {
//         const {slug} = req.query
//         if (!slug) {
//             return res.status(400).json({ message: "Slug query parameter is required" });
//         }
//         const foundProduct = await Product.find({slug:slug})
//         if(!foundProduct){
//             throw new Error("no producs")
//         }
//         res.status(201).json(products)
//     }
// )

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
        const deletedPrd = await Product.findByIdAndDelete(id)
        if(!deleteProduct){
            throw new Error("Deleteing Product Faild")
        }
        res.status(200).json({mssg:`The Product [${id} ${deletedPrd.slug}] was Deleted Successfully`})
    }
)





module.exports = {
    createProduct,
    getProduct,
    // getProductBySlug,
    getAllProducts,
    updateProduct,
    deleteProduct
}