const mongoose = require('mongoose');
const moment = require('moment')
const Schema = mongoose.Schema;
const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
        ref: 'User', 
        
        required: true,
    
  },
  
  items: [{
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product', 
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    subtotal: {
        type: Number,
        
        
    },
    PriceOrder:{
      type:Number,
    },

    originalPrice: {
      type: Number, // Add this field to store the original price
    },
   
}],

  totalAmount: {
    type: Number,
    required: true,
  },
  address:  {
    address: String,
    streetAddress: String,
    apartment: String,
    
    city: String,
    postcode: Number,
    phone: Number,
    email: String,
},
  paymentMethod: {
    type: String,
   // enum: ['COD', 'CreditCard', 'PayPal'],  Adjust based on your payment methods
    
  },
  status: {
    type: String,
    default: 'Pending',
  },
  
  canceled: {
  type: Boolean,
  default: false
  },
  returned:{
    type:Boolean,
    default:false
  },
  returnApprovel:{
    type:Boolean,
    default:false
  },
  dateOrdered:{
    type:Date,
    default:Date.now,
   
  }
});
orderSchema.virtual('formattedDateOrdered').get(function () {
  return moment(this.dateOrdered).format('DD-MM-YYYY HH:mm');
});





const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
