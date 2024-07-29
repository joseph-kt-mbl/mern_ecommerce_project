const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    // category:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"PCategory"
    // },
    category:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    sold:{
        type:Number
    },
    quantity:Number,
    images:{
        type:Array
    },
    color:{
        type:String,
        required:true
    },
    ratings:[
        {
            star: {
                type: Number,
                required: true,
                min: [1, 'Rating must be at least 1'],
                max: [5, 'Rating must be at most 5']
            },
            comment:String,
            postedby:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
        }
    ],
    totalrating:{
        type: Number,
        default:1,
        min: [1, 'Rating percent must be at least 1'],
        max: [100, 'Rating percent must be at most 100']
    }

},
{
    timestamps:true
}

);

//Export the model
module.exports = mongoose.model('Product', productSchema);