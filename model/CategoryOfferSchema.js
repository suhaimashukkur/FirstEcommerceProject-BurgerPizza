// models/categoryOffer.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryOffer = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    
    
  },
  offerPercentage: {
    type: Number,
    required: true,
  }
});

module.exports.CategoryOffer = mongoose.model('CategoryOffer', categoryOffer);
