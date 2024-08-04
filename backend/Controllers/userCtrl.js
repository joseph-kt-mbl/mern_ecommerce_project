const { generateToken } = require('../Config/jwtToken');
const User = require('../Models/userModel');
const Product = require('../Models/productModel')
const Order = require("../Models/orderModel");
const Cart = require("../Models/cartModel");
const Coupon = require("../Models/couponModel");
const uniqid = require("uniqid");

const asyncHandler = require('express-async-handler');
const {ValidateMongodbID} = require('../utils/ValidateMongodbId');
const { generateRefreshToken } = require('../Config/refreshToken.JS');
const jwt  = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto')
const path = require('path')
/**
 * Function to get the parent directory of a given directory path
 * @param {string} dir - The directory path to go up from
 * @returns {string} - The parent directory path
 */
function getParentDirectory(dir) {
    return path.dirname(dir);
}


const createUser = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if the email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ error: "Register failed: Email already exists" });
        }

        // Create a new user
        const newUser = await User.create(req.body);
        return res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user){
            res.status(400).json({ error: "Email not found.." });
        }
        if (user.role === 'user') {
            if(! await user.isPasswordMatched(password)){
            return res.status(400).json({ error: "Invalid password" });
            }
            const refreshToken = generateRefreshToken(user._id)
            const updatedUser = await User.findOneAndUpdate(
                user._id,
                {refreshToken},
                {new:true}
            )
            res.cookie("refreshToken", refreshToken , {
                httpOnly:true,
                maxAge: 7 * 24 * 60 * 60 *1000
            })
            res.status(200).json({
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                mobile: user.mobile,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ error: "you are an admin , This End point Was not made for you." });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// admin login

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // check if user exists or not
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== "admin") throw new Error("Not Authorised");
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findAdmin?._id);
      const updateuser = await User.findByIdAndUpdate(
        findAdmin.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        _id: findAdmin?._id,
        firstname: findAdmin?.firstname,
        lastname: findAdmin?.lastname,
        email: findAdmin?.email,
        mobile: findAdmin?.mobile,
        token: generateToken(findAdmin?._id),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  });

// handle refresh Token
const handleRefreshToken = asyncHandler(
    async (req,res) =>{
        const cookie = req.cookies
        if(!cookie || !cookie.refreshToken) throw new Error('No Refresh Token In Cookies')
            
        const refreshToken = cookie.refreshToken
        const user = await User.findOne({refreshToken})
        if(!user){
            throw new Error("No Refresh Token present in db or not matched")
        }
        jwt.verify(refreshToken,process.env.SECRET , (err,decoded) => {
            if(err || user._id !== decoded._id){
                throw new Error("Verefying Token Faild !")
            }
            const accessToken = generateToken(user._id)
            res.status(200).json({accessToken})
        })
    }
)

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken) {
        return res.status(204).json({ message: 'No Refresh Token in Cookies' }); // No content to send back
    }

    const refreshToken = cookie.refreshToken;

    // Find the user with the refresh token
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', { httpOnly: true, secure: true });
        return res.status(204).json({ message: 'Refresh Token not found in DB' });
    }

    // Remove the refresh token from the database
    user.refreshToken = null;
    await user.save();

    // Clear the cookie
    res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    res.status(200).json({ message: 'Logged out successfully' });
});


const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const allUsers = await User.find({});
        res.status(200).json(allUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const getUserByID = asyncHandler(async (req, res) => {
    const { id } = req.params;
    ValidateMongodbID(id)
    try {
        const user = await User.findById(id);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    ValidateMongodbID(id)
    try {
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    ValidateMongodbID(id)

    try {
        const user = await User.findByIdAndDelete(id);
        if (user) {
            res.status(200).json({ message: "User was deleted successfully" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const blockUser = asyncHandler(
    async (req,res) =>{
        const {id} = req.params
        ValidateMongodbID(id)
        
        const userToBlock = await User.findByIdAndUpdate(id,{isBlocked:true})
        if(userToBlock){
            res.status(200).json({ message: "User was Blocked successfully" });
        }
        else{
            res.status(404).json({error:"User Not Found"})
        }
    }
)


const unBlockUser = asyncHandler(
    async (req,res) =>{
        const {id} = req.params
        ValidateMongodbID(id)

        const userToUnBlock = await User.findByIdAndUpdate(id,{isBlocked:false})
        if(userToUnBlock){
            res.status(200).json({ message: "User was Un-Blocked successfully" });
        }
        else{
            res.status(404).json({error:"User Not Found"})
        }
    }
)


const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User Does not Exist!");
    }

    try {
        const token = await user.createPasswordResetToken();
        await user.save();

        const resetURL = `Hi, follow this link to reset your password. This link is valid for 10 minutes from now.
        <a href='http://localhost:2048/api/user/reset-password/${token}'>Click Here</a>`;

        const data = {
            to: [email],
            text: 'Hey user',
            subject: 'Forgot Password Link',
            html: resetURL,
        };

        sendEmail(data, req, res);
        res.json({ message: 'Password reset email sent', token });
    } catch (error) {
        throw new Error(error.message);
    }
});

const resetPassword = asyncHandler( async (req,res) => {
    const {token} = req.params
    const {password} = req.body
    if(!password){
        throw new Error("No Password Included within body")
    }
    if(!token){
        throw new Error("No Token in params !")
    }
    const hashedToken = crypto
                        .createHash('sha256')
                        .update(token)
                        .digest("hex")
                        

    const UserToChangePwd = await User.findOne(
        {
            passwordResetToken:hashedToken,
            passwordResetExpires:{$gt:Date.now()}
        })
    if(!UserToChangePwd){
        throw new Error("Invalide Reset Token")
    }
    UserToChangePwd.password = password
    UserToChangePwd.passwordResetExpires = undefined
    UserToChangePwd.passwordResetToken = undefined

    await UserToChangePwd.save()

    res.json(UserToChangePwd)
})


const serveResetPasswordPage = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new Error("No Token in params!");
    }

    // Assuming your HTML file is in the root directory of your project.
    const root = getParentDirectory(__dirname) 
    const filePath = path.join(root, 'reset-password.html');
    res.sendFile(filePath);
});



const addToWishList = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { prdId } = req.body;

    if (!id || !prdId) {
        throw new Error("problem in IDs");
    }

    ValidateMongodbID(id);
    ValidateMongodbID(prdId);

    const product = await Product.findById(prdId);
    if (!product) {
        throw new Error("There is No product with This id");
    }

    const user = await User.findById(id);

    // Add product ID to wishlist if it's not already there, otherwise remove it
    if (!user.wishlist.includes(prdId)) {
        user.wishlist.push(prdId);
    } else {
        user.wishlist = user.wishlist.filter(PRD_ID => PRD_ID.toString() !== prdId.toString());
    }

    await user.save();

    const USER = await User.findById(id).populate('wishlist').exec()
    if(!USER){
        throw new Error('Problem in populating USER')
    }
    res.status(200).json(USER);
});

// save user address
const saveAddress = asyncHandler(async(req,res)=>{
    const id = req.user._id
    if (!id ) {
        throw new Error("problem in ID");
    }
    ValidateMongodbID(id);

    const {address} = req.body
    
    const user = await User.findById(id)
    if(!user){
        throw new Error("No user with ths id")
    }
    user.address = address
    try{
        await user.save()
        res.status(200).json(user)
    }catch(error){
        throw new Error("Updating User addres Faild !")
    }
    
})

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    ValidateMongodbID(_id);
    try {
      let products = [];
      const user = await User.findById(_id);
      // check if user already have product in cart
      const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      if (alreadyExistCart) {
        alreadyExistCart.remove();
      }
      for (let i = 0; i < cart.length; i++) {
        let object = {};
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        let getPrice = await Product.findById(cart[i]._id).select("price").exec();
        object.price = getPrice.price;
        products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
      res.json(newCart);
    } catch (error) {
      throw new Error(error);
    }
  });

  const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    ValidateMongodbID(_id);
    try {
      const cart = await Cart.findOne({ orderby: _id }).populate(
        "products.product"
      );
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });

  const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    ValidateMongodbID(_id);
    try {
      const user = await User.findOne({ _id });
      const cart = await Cart.findOneAndRemove({ orderby: user._id });
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });

  const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    ValidateMongodbID(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
      throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({
      orderby: user._id,
    }).populate("products.product");
    let totalAfterDiscount = (
      cartTotal -
      (cartTotal * validCoupon.discount) / 100
    ).toFixed(2);
    await Cart.findOneAndUpdate(
      { orderby: user._id },
      { totalAfterDiscount },
      { new: true }
    );
    res.json(totalAfterDiscount);
  });

  const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    ValidateMongodbID(_id);
    try {
      if (!COD) throw new Error("Create cash order failed");
      const user = await User.findById(_id);
      let userCart = await Cart.findOne({ orderby: user._id });
      let finalAmout = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmout = userCart.totalAfterDiscount;
      } else {
        finalAmout = userCart.cartTotal;
      }
  
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmout,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "usd",
        },
        orderby: user._id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error) {
      throw new Error(error);
    }
  });
    
  const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    ValidateMongodbID(_id);
    try {
      const userorders = await Order.findOne({ orderby: _id })
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
  });

  const getAllOrders = asyncHandler(async (req, res) => {
    try {
      const alluserorders = await Order.find()
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(alluserorders);
    } catch (error) {
      throw new Error(error);
    }
  });
  const getOrderByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    ValidateMongodbID(id);
    try {
      const userorders = await Order.findOne({ orderby: id })
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    ValidateMongodbID(id);
    try {
      const updateOrderStatus = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          paymentIntent: {
            status: status,
          },
        },
        { new: true }
      );
      res.json(updateOrderStatus);
    } catch (error) {
      throw new Error(error);
    }
  });

module.exports = {
    createUser,
    loginUserCtrl,
    getAllUsers,
    getUserByID,
    getUser,
    updateUser,
    deleteUser,
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
};
