const {
    createProduct,
    getProduct,
    getProductBySlug,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require('../Controllers/productCtrl')

const express = require('express')
const router = express.Router()

const {authMiddleware,isAdmin} = require('../Middlewares/authMiddleware')


router.post('/create-product',authMiddleware, isAdmin, createProduct)
router.get('/:id',getProduct)
router.patch('/update/:id',authMiddleware,isAdmin,updateProduct)
// router.get('/slug', getProductBySlug)
router.get('/', getAllProducts)
router.delete('/delete/:id', authMiddleware,isAdmin,deleteProduct)






 

module.exports = router