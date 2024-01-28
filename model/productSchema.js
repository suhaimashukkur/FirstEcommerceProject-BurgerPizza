const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;


const productSchema = Schema({
    name:{
        type: String,
        required: true
    },
    category:{
        type: Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true,
    },
    price:{
         type: Number,
         required: true
    },
    discount: {
        type: Number,
        default: 0,
    },
    description:{
         type: String,
         required: true
    },
    image1:{
        type: String,
        required: true
    },
    image2: {
        type: String
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
        
    },
    haveOffer: {
        type: Boolean,
        default:false
    },

});


productSchema.virtual('formattedDate').get(function () {
    return moment(this.date).format('DD-MM-YYYY HH:mm');
  });
  
  productSchema.index({ date: 1 });


module.exports.Product = mongoose.model('Product', productSchema);