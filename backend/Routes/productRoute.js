const {
    createProduct,
    getProduct,
    getProductBySlug,
    getAllProducts,
    updateProduct,
    deleteProduct,
    addToWishList,
    rating
} = require('../Controllers/productCtrl')

const express = require('express')
const router = express.Router()

const {authMiddleware,isAdmin} = require('../Middlewares/authMiddleware')
const {uploadPhoto} = require('../Middlewares/uploadImages')

router.post('/create-product',authMiddleware, isAdmin, createProduct)
router.put('upload/:id',authMiddleware,isAdmin,uploadPhoto)
router.get('/:id',getProduct)
router.patch('/update/:id',authMiddleware,isAdmin,updateProduct)
router.patch('/wishlist',authMiddleware,addToWishList)
router.patch('/rating',authMiddleware,rating)

router.get('/', getAllProducts)
router.delete('/delete/:id', authMiddleware,isAdmin,deleteProduct)






 

module.exports = router