const express = require('express')
const router = express.Router()

const { 
    createUser,
    loginUserCtrl,
    getAllUsers, 
    getUserByID,
    getUser,
    deleteUser,
    updateUser
} = require('../Controllers/userCtrl')

router.post('/register',createUser)
router.post('/login',loginUserCtrl)
router.get('/allusers',getAllUsers)
router.get('/:id',getUserByID)
router.get('/',getUser)
router.delete('/:id',deleteUser)
router.patch('/:id',updateUser)






module.exports = router