const express = require('express')
const {authMiddleware,isAdmin} = require('../Middlewares/authMiddleware')
const router = express.Router()

const { 
    createUser,
    loginUserCtrl,
    getAllUsers, 
    getUserByID,
    getUser,
    deleteUser,
    updateUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logout,
    forgotPasswordToken,
    resetPassword,
    serveResetPasswordPage,
    loginAdmin,
    addToWishList,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    getAllOrders,
    getOrderByUserId,
    updateOrderStatus
} = require('../Controllers/userCtrl')

router.post('/register',createUser)
router.post('/forgot',authMiddleware,forgotPasswordToken)
router.post('/login',loginUserCtrl)
router.post('/admin-login',loginAdmin)
router.post('/logout',logout)
router.post('/reset-password/:token',resetPassword)
router.post('/cart',authMiddleware, userCart)

// routes four admin
router.get('/allusers',authMiddleware,isAdmin,getAllUsers)
router.get('/:id',authMiddleware,isAdmin,getUserByID)
router.get('/getUser',authMiddleware,isAdmin,getUser)
router.get('/user-cart',authMiddleware,getUserCart)
router.get('/get-orders',authMiddleware,getOrders)
router.get('/getallorders',authMiddleware,isAdmin,getAllOrders)
router.get('/order-by-user/:id',authMiddleware,isAdmin,getOrderByUserId)


router.delete('/:id',authMiddleware,deleteUser)
router.delete('/remove-cart',authMiddleware,emptyCart)

router.patch('/wishlist',authMiddleware,addToWishList)
router.patch('/save-address',authMiddleware,saveAddress)
router.patch('/apply-coupon',authMiddleware,applyCoupon)
router.patch('/order-status/:id',authMiddleware,isAdmin,updateOrderStatus)

router.patch('/:id',updateUser)
router.patch('/block-user/:id',authMiddleware,isAdmin,blockUser)
router.patch('/unblock-user/:id',authMiddleware,isAdmin,unBlockUser)

router.get('/reset-password/:token',)
router.get('/refresh',handleRefreshToken)
router.get('/reset-password/:token',serveResetPasswordPage)


router.put('/ceate-order',authMiddleware,createOrder)




module.exports = router