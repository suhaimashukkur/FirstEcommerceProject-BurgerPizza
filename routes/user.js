var express = require("express");
const {
  signupUser,
  login,
  home,
  signup,
  verifyOtp,
  logout,
  userBlocked,
  verifyLogin,
  renderForgotPassword,
  sendPasswordResetEmail,
  handlePasswordReset,
  addNewPassword,
  verifyresendOtp ,
  otpPage,
  profile,
  editAddress,
  editProfile,
  updateProfile,
  changePassword,
  wallet,
 loginUser,
 renderPasswordReset,
  
  
} = require("../controllers/userController");
const {
  categoriesLoad,
  singleProductView,
  allproducts,
  searchProducts,
  productPaginate,
  productSort,
  productFilter,
} = require("../controllers/productController");
const {
  blockChecker,
  UserLoginChecker,
  userLogedOrNot,

} = require("../middlewares/middlewares");
const {  cartPage, productAddToCart,updateQuantity, removeCartItem,checkout, clearCart} = require('../controllers/cartController');
const { addAddressPage, addAddress, updateAddress, deleteAddress } = require("../controllers/addressController");
const {checkoutAjaxAddress, placeorder, vieworderdetails, SingleOrderDetail, orderCancel, PaymentCheckout, verifyPayment, updateOrderStatus, allowReturn, cancelApprovel, returnApprovel, invoice, invoiceDownload, walletUsage, walletPage} = require("../controllers/orderController");
const { useCoupon, coupons, getCoupons } = require("../controllers/couponController");

var router = express.Router();

//user register and login
router.get("/register", UserLoginChecker, signupUser);
router.post("/signup", UserLoginChecker, signup);
router.post("/verify", UserLoginChecker, verifyOtp);
router.get("/login", UserLoginChecker, login);
router.get("/login-alert", UserLoginChecker, loginUser);
router.get("/forgotPassword", UserLoginChecker, renderForgotPassword);
router.post("/sendPasswordReset", UserLoginChecker, sendPasswordResetEmail);
router.post("/resetPassword/:id", UserLoginChecker, handlePasswordReset);
router.post("/addNewPassword/:id", UserLoginChecker, addNewPassword);
router.post('/confirmPassword/:id',UserLoginChecker,renderPasswordReset)
router.get("/blocked",userLogedOrNot,UserLoginChecker, blockChecker, userBlocked);
router.get("/resendOtp",blockChecker, verifyresendOtp );
router.get("/loadOtpPage", UserLoginChecker,blockChecker,otpPage);
router.post("/loginHome", UserLoginChecker,blockChecker, verifyLogin);


//home
router.get("/",userLogedOrNot, blockChecker, home);
router.get("/home", blockChecker, home);
router.get("/category/:id",blockChecker, categoriesLoad);
router.get("/single-product/:id", blockChecker, singleProductView);
router.get("/allProducts", blockChecker, allproducts);
router.post("/product-search", blockChecker, searchProducts);
router.get('/product-sort', blockChecker,productSort)
router.get('/product-filter',blockChecker, productFilter)
router.post('/pagination',blockChecker, productPaginate)


//cart
router.get('/addToCart/:id',userLogedOrNot, productAddToCart)
router.get('/cart-remove/:id', userLogedOrNot,blockChecker,removeCartItem);
router.get('/cart',userLogedOrNot,blockChecker, cartPage)
router.post('/clear-cart',userLogedOrNot,blockChecker, clearCart)
router.post('/updateCart',userLogedOrNot,blockChecker, updateQuantity)


//place-order-checkout
router.get('/checkout', userLogedOrNot, blockChecker, checkout);
router.post('/checkout-address',userLogedOrNot, blockChecker, checkoutAjaxAddress)
router.get('/place-order/:orderid', userLogedOrNot,blockChecker,placeorder)
router.post('/checkoutpayment', userLogedOrNot,blockChecker,PaymentCheckout)
router.post('/verifiedpayment', userLogedOrNot,blockChecker,verifyPayment)



//order Details
router.get('/vieworderdetails', userLogedOrNot,blockChecker,vieworderdetails);
router.get('/view-order-details/:id',userLogedOrNot,blockChecker, SingleOrderDetail);
router.get('/cancel-order/:id',userLogedOrNot,blockChecker, orderCancel)
router.post('/update-order-status/:id', blockChecker, updateOrderStatus)
router.get('/return-order/:id',blockChecker, allowReturn)
router.post("/order-invoice", blockChecker,userLogedOrNot, invoiceDownload);


//Profile
router.get("/profile",userLogedOrNot,profile);
router.get("/address", userLogedOrNot,blockChecker, addAddressPage)
router.post('/add-address',userLogedOrNot,blockChecker, addAddress)
router.get('/user/edit-address/:id', userLogedOrNot, blockChecker,editAddress)
router.post('/update-address/:id', userLogedOrNot, blockChecker,updateAddress)
router.get('/user/edit-profile/:id', userLogedOrNot, blockChecker,editProfile)
router.post('/update-profile/:id', userLogedOrNot, blockChecker,updateProfile)
router.get('/user/change-password/:id', userLogedOrNot, blockChecker, changePassword)
router.get('/user/delete-address/:id', blockChecker, deleteAddress);
router.get("/wallet",blockChecker,userLogedOrNot, walletPage); 
router.post("/use-wallet",blockChecker,userLogedOrNot, walletUsage);



//coupon
router.post('/use-coupon',blockChecker, useCoupon)
router.get('/coupon',blockChecker, coupons)
router.get('/get-coupons',blockChecker, getCoupons)
router.get("/logout",userLogedOrNot,blockChecker, logout);



module.exports = router;


