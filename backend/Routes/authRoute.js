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
    serveResetPasswordPage
} = require('../Controllers/userCtrl')

router.post('/register',createUser)
router.post('/forgot',authMiddleware,forgotPasswordToken)
router.post('/login',loginUserCtrl)
router.post('/logout',logout)
router.post('/reset-password/:token',resetPassword)

// routes four admin
router.get('/allusers',authMiddleware,isAdmin,getAllUsers)
router.get('/:id',authMiddleware,isAdmin,getUserByID)
router.get('/getUser',authMiddleware,isAdmin,getUser)
router.delete('/:id',authMiddleware,deleteUser)

router.patch('/:id',updateUser)
router.patch('/block-user/:id',authMiddleware,isAdmin,blockUser)
router.patch('/unblock-user/:id',authMiddleware,isAdmin,unBlockUser)

router.get('/reset-password/:token',)
router.get('/refresh',handleRefreshToken)
router.get('/reset-password/:token',serveResetPasswordPage)




module.exports = router