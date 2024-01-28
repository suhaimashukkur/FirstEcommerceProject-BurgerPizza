


const Order = require('../model/orderSchema'); 
const { Product } = require("../model/productSchema");
const { User } = require('../model/userSchema');
const { Category } = require("../model/categorySchema");
const Cart = require('../model/cartSchema');
const { Address } = require('../model/addressSchema');
const { Wallet } = require("../model/walletSchema");
const { Transaction } = require("../model/walletTransactionSchema");
const {Coupon} = require('../model/couponSchema')
// const { KEY_ID, SECRET_RAZO } = process.env;
const fs = require('fs')
const easyinvoice = require('easyinvoice')
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config()

const keyId = process.env.KEY_ID;
const secretRazo = process.env.SECRET_RAZO;

var instance = new Razorpay({
  key_id: keyId,
  key_secret: secretRazo,
});


const mongoose = require('mongoose')
module.exports.checkoutAjaxAddress = async (req, res) => {
  try {
   
    //const addressId = req.body.addressId;
   const addressId = parseInt(req.body.addressId); // Assuming addressId is an index
   const paymentMethod = req.body.paymentMethod;
   const orderTotal = Number(req.body.orderTotal);
   const id = req.session.user_id;
   
   console.log('Received orderTotal:', orderTotal);
  //  if (isNaN(orderTotal)) {
  //   // Handle the case where orderTotal is not a valid number
  //   res.status(400).send('Invalid orderTotal');
  //   return;
  // }



   const cart = await Cart.findOne({userId: id});
  
   const address = await Address.findOne({ userId: id });
console.log('Address:', address);

// Check if 'addresses' is an array and has elements
const selectedAddress = address?.addresses?.[addressId];

 const newOrder = new Order({
     
    userId: id,
      items: cart.items,
      
      
      totalAmount: orderTotal,
      address: {
        address: selectedAddress.address,
        streetAddress: selectedAddress.streetAddress,
        apartment: selectedAddress.apartment,
        city: selectedAddress.city,
        postcode: selectedAddress.postcode,
        phone: selectedAddress.phone,
        email: selectedAddress.email
      },
      paymentMethod: paymentMethod,
    });
   const saved = await newOrder.save();
const orderId = newOrder._id;
   if(saved){
     res.send(orderId);
   }else{
     console.log('error saving the order');
   }
   
   
   console.log(addressId)
  } catch (error) {
   console.log(error.message)
  }
    };

  
   
   module.exports.PaymentCheckout = async (req, res) => {
     try {
      
       const orderId = req.body.orderId;
       const total = req.body.orderTotal;
   
       const newOrder = await Order.findById(orderId);
       newOrder.totalAmount = total;
       await newOrder.save();
   
       if (!newOrder) {
         console.log('Order not found');
         return res.status(404).send('Order not found');
       }
   
       const options = {
         amount: newOrder.totalAmount * 100, // Check the field name, use the correct one
         currency: 'INR',
         receipt: 'razorUser@gmail.com',
       };
   
       instance.orders.create(options, function(err, order) {
 
         console.log(order);
         res.send(order)
   
   });
     } catch (error) {
       console.log('Try catch error in PaymentCheckout:', error.message);
       res.status(500).send('Internal Server Error');
}
};


module.exports.verifyPayment = async (req, res) => {
  try {
    console.log(req.body, "Success of order 📀📀📀📀📀📀😁😁❤❤");
    const orderId = req.body.orderId;
    const details = req.body;

    const secretKey = "yN8SCkP11hp5ZcytynJRRvBL"; 
    const crypto = require("crypto"); 
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(
      details['payment[razorpay_order_id]'] +
        "|" +
        details['payment[razorpay_payment_id]']
    );
    const calculatedHmac = hmac.digest("hex");

    console.log(calculatedHmac, "HMAC calculated");

    if (calculatedHmac === details['payment[razorpay_signature]']) {
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            paymentstatus: "placed",
          },
        }
      );

      console.log("Payment is successful");
      res.json({ status: true });
    } else {
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            paymentstatus: "failed",
          },
        }
      );

      console.log("Payment is failed");
      res.json({ status: false, errMsg: "Payment verification failed" });
    }
  } catch (error) {
    console.log('Try catch error in verifyPayment  🤷‍♂📀🤷‍♀');
    console.log(error.message);
}
};



    module.exports.placeorder = async(req,res)=>{
      try {
          
        const order = await Order.findById(req.params.orderid).populate('items.product');
        
        
        console.log(order);
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        res.render('user/success', { order});
      } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
      }
     };
     
    
    
     module.exports.vieworderdetails = async (req, res) => {
      try {
        const userId = req.session.user_id;
        const category = await Category.find({ active: true });
       
        const order = await Order.find({ userId: userId })
          .sort({ dateOrdered: -1 })
          .populate('items.product')
          .exec(); // Moved exec() here
    
        if (!order || order.length === 0) {
          console.log("No order available...");
          // You might want to handle this case accordingly
        }
    
        res.render('user/vieworders', { order: order, user: userId, category: category });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    };
    

     module.exports.SingleOrderDetail = async(req,res)=>{
      try {
        const orderId = req.params.id;
        const userId = req.session.user_id
        const category = await Category.find({ active: true });
        const orderDb = await Order.findOne({_id: orderId})
        const order= await Order.findOne({_id: orderId}).populate('items.product');

        res.render("user/viewOrderDetail", {order: order,category:category,user:userId})
      } catch (error) {
        console.log(error.message);
      }
     }


     module.exports.orderManagement =  async (req, res) => {
      try {
        //constorderId = req.params.orderid;
        const userId = req.session.user_id
        const category = await Category.find({ active: true });
        const coupon = await Coupon.find()
        const order = await Order.find()
        .populate({
          path: 'userId',
          select: 'name' // Specify the field(s) you want to populate from the User model
        })
        .populate('items.product').sort({  dateOrdered: 'desc' });
     
        // const order = await Order.find().populate('items.product').populate('userId');
        console.log(order);
     
        if (!order) {
          console.log("no order is available....")
        }
     
         
        // Render the order details page with the retrieved order
        res.render('admin/orderManagement', { order: order,category:category,user:userId,coupon });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
     };
     
    

    module.exports.updateOrderStatus = async (req, res) => {
      try {
        const orderId = req.body.orderId;
        const orderStatus = req.body.orderStatus;
    
        const order = await Order.findOneAndUpdate(
          { _id: orderId },
          { $set: { status: orderStatus } },
          { new: true }
        );
    
        if (orderStatus === 'Delivered') {
          order.dateDelivered = Date.now();
        }
    
        const savedOrder = await order.save();
    
        if (savedOrder) {
          console.log(savedOrder);
         res.send(orderStatus);
        } else {
          console.log('Data was not saved');
          res.status(500).send('Internal Server Error');
        }
      } catch (error) {
        console.log('Try-catch error');
        console.log(error.message);
        res.status(500).send('Internal Server Error');
}
};


module.exports.allowReturn = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({ _id: id });
    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.returned = true;
    await order.save();

    console.log(order + "hloo");
    res.redirect('/view-order-details/' + id);
   }
 catch (error) {
    console.error(error.message);
    res.status(500).send('Internal ServerError');
 }
};



 module.exports.viewdetails = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // Retrieve order details based on the order ID
    const order = await Order.findById(orderId)
      .populate({
        path: 'userId',
        select: 'name' // Specify the field(s) you want to populate from the User model
      })
      .populate('items.product');

    if (!order) {
      // Handle case where order details are not found
      return res.status(404).send('Order not found');
    }

    // Render a view with the order details
    res.render('admin/orderDetails', { order });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

    

    module.exports.orderCancel = async(req,res)=>{
      try {
        const id = req.params.id;
        const userId = req.session.user_id;
        const cancelOrder = await Order.findOneAndUpdate({_id: id},{
          $set: {
            canceled: true
          }
        });

        if (!cancelOrder) {
          console.log('Error in cancelling the order or unauthorized access');
          return res.status(400).send('Error in cancelling the order or unauthorized access');
      }
  
      // If the payment method is Razorpay, refund the amount to the wallet
      if (cancelOrder.paymentMethod === 'Razorpay') {
          let wallet = await Wallet.findOne({ userId: userId });
          let transaction = await Transaction.findOne({ userId: userId });
  
          if (!wallet) {
          var  newWallet = new Wallet({
                  userId: userId,
                  walletBalance: cancelOrder.totalAmount,
              });
   await newWallet.save();
              console.log("hloo" + 'new wallet created')
  
          }else{
            wallet.walletBalance += cancelOrder.totalAmount;
            await wallet.save();
          }

          if (!transaction) {
              transaction = new Transaction({
                  userId: userId,
                  transaction: [{ mode: 'Credit', amount: cancelOrder.totalAmount }],
              });
              console.log("hloo" + 'new  transaction created')
  
          } else {
              transaction.transaction.push({ mode: 'Credit', amount: cancelOrder.totalAmount });
          }
  
          await transaction.save();
      }

      if(cancelOrder){
       res.redirect('/view-order-details/'+id);
      }
      } catch (error) {
        console.log(error.message)
      }
    }


    module.exports.walletPage = async(req,res)=>{
      try {
        const id =  req.session.user_id
      
        const userWallet = await Wallet.findOne({userId: id})
        const category = await Category.find({ active: true });
        console.log(userWallet)
        
        const user = req.session.user_id;
    
        const trans = await Transaction.findOne({userId: id}).sort({_id: -1});
        console.log(trans)
    
        res.render('user/wallet', {balance: userWallet,category:category , user: user, transactions: trans});
      } catch (error) {
        console.log('Try catch error in walletPage  🤷‍♂️📀🤷‍♀️');
        console.log(error.message);
      }
    };
    
    // <-------------------------------------------------------| RENDERING WALLET PAGE ----------------------------------------------------|>
    module.exports.walletUsage = async (req, res) => {
      try {
        const userId = req.session.user_id;
    
        const userWallet = await Wallet.findOne({ userId: userId });
        const userCart = await Cart.findOne({ userId: userId });
        const TransactionDb = await Transaction.findOne({userId: userId})
    
    
    
        if (!userCart) {
          return res.status(400).send("No cart available.");
        }
    
        if (!userWallet) {
          return res.status(400).send("No wallet available.");
        }
    
        const total = parseFloat(req.body.data);
        const walletBalance = userWallet.walletBalance
    
        let orderTotal = 0;
        let wallet = 0;
        let totalSave = 0;
    
        if (total < walletBalance) {
          wallet =  walletBalance -  total;
          totalSave = total
          userWallet.walletBalance = wallet;
          await userWallet.save();
          const pushTrans = {
              mode: "Debit",
              amount: totalSave
            }
    
            TransactionDb.transaction.push(pushTrans)
        
          await TransactionDb.save();
    
        } else{
          totalSave = walletBalance
          orderTotal = total - walletBalance;
          wallet = 0;
          userWallet.walletBalance = wallet;
          await userWallet.save();
          const pushTrans = {
            mode: "Debit",
            amount: totalSave
          }
    
          TransactionDb.transaction.push(pushTrans)
      
        await TransactionDb.save();
    
        } 
    
        res.send({ totalBalance: orderTotal, walletBalance: wallet, saved: totalSave});
      } catch (error) {
        console.log('Try catch error in walletUsage  ');
        console.log(error.message);
      }
    };


    module.exports.returnApprovel = async (req, res) => {
      try {
          const id = req.params.id;
  
          const returnApprovel = await Order.findOneAndUpdate(
              { _id: id },
              {
                  $set: {
                    
                      
                      returnApprovel: true,
                      //returned:true // Set returnRequest to false as it's now approved
                      
                  },
              },
              { new: true } // This option returns the modified document
          );
          console.log('returnApprovel:', returnApprovel);
          const user = returnApprovel.userId;
              const walletAvailable = await Wallet.findOne({userId: user});
              const transactionDb  = await Transaction.findOne({userId: user});
 
       if (returnApprovel) {

        if(walletAvailable){
          await Wallet.findOneAndUpdate({userId: user},{
            $set: {
              walletBalance: returnApprovel.totalAmount + walletAvailable.walletBalance
            }
          })
  
          const trans = {
            mode: 'Credit',
            amount: returnApprovel.totalAmount
          }
          transactionDb.transaction.push(trans);
  
         const pushTans =  await transactionDb.save();
  
         if(pushTans){
          console.log('transaction details pushed  ');
         }else{
          console.log('error pushing transactioh details');
         }
  
        }else{
          const OrderReturnMoney = new Wallet({
            userId: returnApprovel.userId,
            walletBalance: returnApprovel.totalAmount
          
          }) 
          
          const saved = await OrderReturnMoney.save();
  
          
          const newTrans = new Transaction({
            userId: user,
            transaction: [{
              mode: 'Credit',
             amount: returnApprovel.totalAmount,
  
           }]
          })
  
          const SaveNewTrans = await newTrans.save();
  
          if(SaveNewTrans){
            console.log('New transaction has been saved  ');
          }else{
            console.log("Error saving new TRansaction ");
          }
  
  if(saved){
    console.log('money Added to the wallet ');
  }else{
    console.log("Money adding to walle failed ! ");
  }
          
        }


               res.redirect('/admin/view-order-details-admin/' + id);
           }
           else{
            console.log("return approval failed ");
          }
       } catch (error) {
           console.log(error.message);
       }
   }

   module.exports.invoiceDownload= async (req, res) => {
    try {
      // const user = await User.find({});
   
    
      const id = req.body.orderId;
      console.log(id)
      const address = await Address.findOne({  });
      const order = await Order.findById(id)
      .populate('items.product');
       console.log(order)
       res.send(order);
     
      console.log(order)
      
  
    } catch (error) {
      console.log('Try catch error in invoiceDownload  ');
      console.log(error.message);
    }
  };
  
  
  
     