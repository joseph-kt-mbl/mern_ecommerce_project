const User = require('../Models/userModel')
const jwt = require('jsonwebtoken')

const asyncHandler = require('express-async-handler')

const authMiddleware = asyncHandler(
    async (req,res,next) =>{
        console.log("auth middleware")
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1]
            console.log("starts with bearer..")

            try {
                if(token){
                    console.log("token decoding..")
                    const decoded = jwt.verify(token,process.env.SECRET)
                    const user = await User.findById(decoded._id)
                    req.user = user
                }
                next();
                  
            } catch (error) {
                throw new Error('Not Authorized Token Expired, Please login again')
            }
            
        }else{
            throw new Error('No Token Attached To the header')
        }

    }
)


const isAdmin = asyncHandler(async (req,res,next) => {
    const {email} = req.user
    const adminUser = await User.findOne({email})
    
    if(adminUser.role !=='admin'){
        throw new Error('you are not an admin !')
    }else{
        next()
    }

}) 


module.exports = {authMiddleware,isAdmin}