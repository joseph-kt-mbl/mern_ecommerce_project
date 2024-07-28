const Blog = require('../Models/blogModel')
const User = require('../Models/userModel')

const asyncHandler = require('express-async-handler');
const {ValidateMongodbID} = require('../utils/ValidateMongodbId');


const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body)
        res.status(200).json(newBlog)
    } catch (error) {
        throw new Error(error.message)
    }
})


const updateBlog = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params
        if (!id) {
            return res.status(400).json({ error: "No ID in the parameters" });
        }
        const updatedBlog = await Blog.findByIdAndUpdate(id,{...req.body},{new:true})
        if (!updatedBlog) {
            return res.status(404).json({ error: "Blog to update not found" });
        }
        res.status(200).json(updatedBlog)
    } catch (error) {
        throw new Error(error.message)
    }
})

const getBlog = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "No ID in the parameters" });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Increment the number of views
        blog.numberOfViews++;
        await blog.save();

        // Check if the logged-in user has liked or disliked the blog
        const loginUserId = req?.user?._id;
        const isLiked = blog.likes.some(userId => userId.toString() === loginUserId.toString());
        const isDisliked = blog.dislikes.some(userId => userId.toString() === loginUserId.toString());

        // Add virtual data to the response
        const blogWithVirtuals = {
            ...blog.toObject(),
            isLiked,
            isDisliked
        };

        res.status(200).json(blogWithVirtuals);
    } catch (error) {
        throw new Error(error.message);
    }
});


const getAllBlogs = asyncHandler(async (req, res) => {
    try {
       
        const blogs = await Blog.find({})
       
        if (!blogs) {
            return res.status(404).json({ error: "no Blogs" });
        }
        res.status(200).json({count:blogs.length,blogs:blogs})
    } catch (error) {
        throw new Error(error.message)
    }
})

const deleteBlog = asyncHandler(async (req, res) => {
        const {id} = req.params
        if (!id) {
            return res.status(400).json({ error: "No ID in the parameters" });
        }
        
        try {
        
        const blog = await Blog.findByIdAndDelete(id)
       
        if (!blog) {
            return res.status(404).json({ error: "Blog not found to be deleted" });
        }
        
        
        res.status(200).json(blog)
    } catch (error) {
        throw new Error(error.message)
    }
})

const likeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "No ID in the parameters" });
    }

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found to be liked" });
        }

        // Remove user ID from dislikes array if it exists
        blog.dislikes = blog.dislikes.filter(userId => userId.toString() !== req.user._id.toString());

        // Add user ID to likes array if it's not already there
        if (!blog.likes.includes(req.user._id)) {
            blog.likes.push(req.user._id);
        }

        await blog.save();

        res.status(200).json({ message: `User ${req.user._id} likes this blog`, blog: blog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const removeLike = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "No ID in the parameters" });
    }

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Remove user ID from likes array
        blog.likes = blog.likes.filter(userId => userId.toString() !== req.user._id.toString());

        await blog.save();

        res.status(200).json({ message: `User ${req.user._id} removed their like from this blog`, blog: blog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const dislikeBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "No ID in the parameters" });
    }

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found to be disliked" });
        }

        // Remove user ID from likes array if it exists
        blog.likes = blog.likes.filter(userId => userId.toString() !== req.user._id.toString());

        // Add user ID to dislikes array if it's not already there
        if (!blog.dislikes.includes(req.user._id)) {
            blog.dislikes.push(req.user._id);
        }

        await blog.save();

        res.status(200).json({ message: `User ${req.user._id} dislikes this blog`, blog: blog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const removeDislike = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "No ID in the parameters" });
    }

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Remove user ID from dislikes array
        blog.dislikes = blog.dislikes.filter(userId => userId.toString() !== req.user._id.toString());

        await blog.save();

        res.status(200).json({ message: `User ${req.user._id} removed their dislike from this blog`, blog: blog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});






module.exports = {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    removeLike,
    dislikeBlog,
    removeDislike
}