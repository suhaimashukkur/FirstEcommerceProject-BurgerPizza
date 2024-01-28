const mongoose = require('mongoose');

let productOfferSchema = mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    offerPrice: {
        type: Number,
        required: false,
    },
    expiryDate: {
        type: Date,
        required: true,
    }
});

let ProductOffer = mongoose.model('productOffer', productOfferSchema);

module.exports = ProductOffer;