const asyncHandler = require("express-async-handler");

const uploadImages = asyncHandler(
    async(req,res)=>{
        res.json(req.files)
    }
)

module.exports = uploadImages