

const { Product } = require("../model/productSchema");
const  Cart  = require('../model/cartSchema');
const { Category } = require("../model/categorySchema");
const { User } = require('../model/userSchema');
const { Address } = require('../model/addressSchema');
const { Wallet } = require("../model/walletSchema");
const { Transaction } = require("../model/walletTransactionSchema");
const {Coupon} = require('../model/couponSchema')
const mongoose = require('mongoose');


module.exports.productAddToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.session.user_id;

    console.log(userId + + productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send('Invalid product ID');
    }

    const cart = await Cart.findOne({ userId: userId }).populate("items.product");

    if (!cart) {
      const newCart = new Cart({
        userId: userId,
        items: [{ product: productId, quantity: 1 }],
        totalprice: 0,
        totalQuantity: 1,
      });

      await newCart.save();
      return res.redirect('/single-product/' + productId);
    }

    const existingCartItem = cart.items.find((item) => item.product.equals(productId));

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    // Log product prices for debugging
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      console.log('Product price:', product.price);
    }
    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    cart.totalprice = total;
    cart.totalQuantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    await cart.save();

    res.redirect('/single-product/' + productId);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};

  



module.exports.cartPage = async (req, res) => {
  try {
    const userId = req.session.user_id;

    // Fetch all categories
    const category = await Category.find({ active: true });

   
    const cart = await Cart.findOne({ userId }).populate('items.product');
   
    const productId = req.query.productId;
    const cartId = cart._id;
    res.render('user/cart', { cart: cart, category: category, user: userId,productId,cartId });
  } catch (error) {
    console.error('Error in cartPage:', error);
    res.status(500).send('Internal Server Error');
  }
};



module.exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { productId, quantity, totalPrice } = req.body;

    const cart = await Cart.findOne({ userId }).populate('items.product');

    const itemToUpdate = cart.items.find((item) => item.product._id.toString() === productId);
    if (itemToUpdate) {
      const previousQuantity = itemToUpdate.quantity;
      const productPrice = itemToUpdate.product.price;

      itemToUpdate.quantity = quantity;
      await cart.save();
      const newSubtotal = itemToUpdate.product.price * quantity;
      await cart.save();
       
      // Recalculate the total price after updating quantity
      let total = cart.items.reduce((acc, item) => {
        const itemTotal = item.product.price * item.quantity;
        return acc + itemTotal;
      }, 0);

      cart.totalprice = total;
      await cart.save();

      return res.json({
        success: true,
        message: "Cart updated successfully",
        newSubtotal:newSubtotal,
        totalPrice: cart.totalprice,
        previousQuantity: previousQuantity,
        newQuantity: quantity,
        productId: productId,
        // You can include the totalPrice in the response if needed
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
      });
    }
  } catch (error) {
    console.log("Error in updateQuantity:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


module.exports.removeCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user_id;

    const cart = await Cart.findOne({ userId: userId }).populate('items.product');
    
    let productIndex = -1; 

    if (cart) {
      productIndex = cart.items.findIndex((item) => item.product._id.toString() === id);
    }

    if (productIndex !== -1) {
      cart.items.splice(productIndex, 1);
      await cart.save();
      return res.redirect('/cart'); // Return the response after redirect
    } else {
      console.log("Product not found in the cart.");
      return res.send("Product not found in the cart.");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error"); 
  }
};


module.exports.checkout = async (req, res) => {
  try {
    const id =  req.session.user_id
      const wallet = await Wallet.findOne({userId: id})
      const user = req.session.user_id;
      const addresses = await Address.findOne({ userId: user });
      const category = await Category.find({ active: true });
      const trans = await Transaction.findOne({userId: id}).sort({_id: -1});
      const cart = await Cart.findOne({userId:  user }).populate('items.product');
      const availableCoupons = await Coupon.find({ active: true, expirationDate: { $gt: new Date() } });

      // Render the checkout page with user's addresses
      res.render('user/checkout', {cart:cart, addresses: addresses ,category:category,user:user,wallet:wallet,transactions: trans,availableCoupons });
  } catch (error) {
    console.error('Error in cartPage:', error);
    res.status(500).send('Internal ServerError');
}
};



// Controller function to clear the cart
module.exports.clearCart = async (req, res) => {
  try {
    
    const userId = req.session.user_id;
    
    // Find the cart belonging to the user and delete its contents
    const cart = await Cart.findOneAndUpdate(
      { userId: userId }, // Assuming your cart model has a field 'userId'
      { $set: { items: [] } }, // Set the items array to an empty array to clear the cart
      { new: true }
    );

    res.status(200).json({ message: 'Cart cleared successfully', cart: cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};



