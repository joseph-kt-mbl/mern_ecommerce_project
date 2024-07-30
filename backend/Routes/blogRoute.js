const {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    removeLike,
    dislikeBlog,
    removeDislike,
    uploadImages
} = require('../Controllers/blogCtrl')

const express = require('express')
const { authMiddleware, isAdmin } = require('../Middlewares/authMiddleware')
const router = express.Router()

// Admin routes
router.post('/create', authMiddleware, isAdmin, createBlog)
router.put('/update/:id', authMiddleware, isAdmin, updateBlog)

const {uploadPhoto,blogImgResize} = require('../Middlewares/uploadImages')





router.put(
    '/upload/:id',
    authMiddleware,
    isAdmin,
    uploadPhoto.array('images',10),
    blogImgResize,
    uploadImages
)

router.delete('/delete/:id', authMiddleware, isAdmin, deleteBlog)
router.get('/getallblogs', authMiddleware, isAdmin, getAllBlogs)

// Authenticated user routes
router.get('/getblog/:id', authMiddleware, getBlog)

    // Like and dislike routes
    router.patch('/like/:id', authMiddleware, likeBlog)
    router.patch('/like/remove/:id', authMiddleware, removeLike)
    router.patch('/dislike/:id', authMiddleware, dislikeBlog)
    router.patch('/dislike/remove/:id', authMiddleware, removeDislike)



module.exports = router
