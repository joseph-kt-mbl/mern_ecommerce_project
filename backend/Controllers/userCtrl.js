const { generateToken } = require('../Config/jwtToken');
const User = require('../Models/userModel');
const asyncHandler = require('express-async-handler')

const createUser = asyncHandler(
    async (req, res) => {
        try {
          const { email } = req.body;
      
          // Check if email is provided
          if (!email) {
            return res.status(400).json({ error: "Email is required" });
          }
      
          // Check if the email already exists
          const emailExists = await User.findOne({ email:email });
          if (emailExists) {
            return res.status(400).json({ error: "Register failed: Email already exists" });
          }
      
          // Create a new user
          const newUser = await User.create(req.body);
          return res.status(201).json(newUser);
        } catch (error) {
            throw new Error('User Already Exists')
        }
      }
)

const loginUserCtrl = asyncHandler(
    async (req,res) => {
        const {email,password} = req.body
        const user = await User.findOne({email})
        if(user){
            const matchedPasword = await user.isPasswordMatched(password)
            if(matchedPasword){
                res.status(201).json({
                    _id:user._id,
                    firstname:user.firstname,
                    lastname:user.lastname,
                    email:user.email,
                    mobile:user.mobile,
                    token:generateToken(user._id)
                })
            }
            else{
                res.status(400).json({
                    error:"password doesnt match"
                })
            }
        }
        else{
            res.status(500).json({
                error:'User Does not Exists'
            })
        }
    }
)

const getAllUsers = asyncHandler(
    async (req,res) => {
    try {
        const AllUsers = await User.find({})
        res.status(200).json(AllUsers)

    } catch (error) {
        throw new Error(error)
    }
}) 

const getUserByID = asyncHandler(
    async (req,res) => {
    const _id = req.params.id
        try {
            const user = await User.findOne({_id})
            res.status(200).json(user)

        } catch (error) {
            throw new Error(error)
        }
})

const getUser = asyncHandler(async (req, res) => {
    const { email, mobile } = req.query;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (mobile) {
            user = await User.findOne({ mobile });
        } else {
            return res.status(400).json({ message: 'Email or mobile number is required' });
        }

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// UPDATE A USER
const updateUser = async (req,res) => {
    const _id = req.params.id
    const updatedUser = await User.findByIdAndUpdate(_id,req.body)
    if(updatedUser){
        res.status(200).json(updatedUser);
    }else{
        throw new Error("Updating User Faild !")
    }
}
// DELETE A USER
const deleteUser = async (req,res) => {
    const _id = req.params.id
    const user = await User.findByIdAndDelete(_id)
    if(user){
        res.status(200).json({mssg:"User was deleted Successfully"},user)
    }
    else{
        res.status(500).json({error:"User Does not exists."})
    }
}

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUsers,
  getUserByID,
  getUser,
  deleteUser,
  updateUser
};
