const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true
    },
    numberOfViews:{
        type:Number,
        required:true,
        default:0
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    dislikes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    author:{
        type:String,
        default:'Admin'
    },
    images: [],
},{
    // toJSON:{
    //     virtuals:true
    // },
    toObject:true,
    timestamps:true

});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);