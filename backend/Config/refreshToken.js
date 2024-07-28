const jwt = require('jsonwebtoken')
const generateRefreshToken = (_id) => {
    return jwt.sign({_id},process.env.SECRET,{expiresIn:"7d"})
}

module.exports = {generateRefreshToken}