const mongoose = require("mongoose")
const Schema = mongoose.Schema;



const categorySchema = new Schema({
    categoryName : {
        type:String,
        trim:"true",
        uppercase:"true"

    },
    active:{
        type:Boolean,
        default:true
    },
    haveOffer: {
        type: Boolean,
        required: true,
        default: false
    },
})

module.exports.Category = mongoose.model("Category",categorySchema)




