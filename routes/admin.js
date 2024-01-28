var express = require('express');
const { login, verifyAdmin, userManagment, activateUser, deactivateUser, deactivateCategory, activateCategory, logout,dash, couponLoad, couponAdd, couponDeactivate, couponActivate, couponEdi, userPagination, adminHome, adminHomee, chartData, lastWeekChart, productChart, offer, createCategoryOffer, getAllCategoryOffers, addCategoryOffer, updateOfferPrice, offerPage, productOfferAddPage, addProductOffer, deleteProductOffer, categoryOfferAddPage, categoryOfferDelete  } = require('../controllers/adminController');
const { productPage, categoryPage, addCategory, AddProductPage, addProduct, EditProductPage, updateProduct, deleteProduct, editCategory, updateCategory, pagination, removeProductImage, deleteImage} = require('../controllers/productController');
//const adminCheckMiddleware=require('../middlewares/middlewares')
const {orderManagement, updateOrderStatus, viewdetails, returnApprovel}= require('../controllers/orderController');
var router = express.Router();
const multer = require("multer");
const path = require("path");
const store = require('../middlewares/multer');
const { adminSessionCheck } = require('../middlewares/middlewares');
const { generateCoupon, couponMg, addCouponPage, addCoupon, DeleteCoupon, deleteCoupon, editCoupon, updateCoupon} = require('../controllers/couponController');
const { salesReport, salesReportPage } = require('../controllers/salesController');



router.get('/',adminSessionCheck, login);
router.post('/verify',adminSessionCheck, verifyAdmin);

//Dashboard-Graph
router.get('/dashboard', adminSessionCheck, dash)
router.get('/getChartData',adminSessionCheck, chartData)



//user Management
router.get('/user-mg',adminSessionCheck,  userManagment);
router.get("/unblock/:id",adminSessionCheck,  activateUser);
router.get("/block/:id", adminSessionCheck,  deactivateUser);



//category Managenet
router.get('/category-mg',adminSessionCheck, categoryPage);
router.get("/deactivate/:id", adminSessionCheck, deactivateCategory);
router.get('/activate/:id', adminSessionCheck, activateCategory)
router.post("/add-category",adminSessionCheck, addCategory)
router.get('/edit-category/:id', adminSessionCheck,  editCategory)
router.post('/update-category/:id', adminSessionCheck,  updateCategory);


//Product Management
router.get('/product-mg', adminSessionCheck, productPage);
router.get("/addproducts",adminSessionCheck,  AddProductPage)
router.post("/add-product",store.upload.any(),  adminSessionCheck, addProduct);
router.get('/edit-product/:id', adminSessionCheck, EditProductPage )
router.post('/update-product/:id',store.upload.any(),  adminSessionCheck, updateProduct)
router.get('/delete-product/:id', adminSessionCheck, deleteProduct);
router.post('/pagination', adminSessionCheck, pagination)



//order Managenet
router.get('/orderManagement', adminSessionCheck,  orderManagement);
router.post('/view-order-details-admin', adminSessionCheck, updateOrderStatus)
router.get('/approve-return/:id', adminSessionCheck, returnApprovel)
router.get('/view-order-details-admin/:orderId', adminSessionCheck, viewdetails)
router.post('/updateOrderStatus',adminSessionCheck, updateOrderStatus)



//coupon Managenet
router.post('/generate-coupon', adminSessionCheck, generateCoupon)
router.get('/add-couponPage', adminSessionCheck, addCouponPage)
router.post('/add-coupon', adminSessionCheck,addCoupon)
router.get('/delete-coupon/:id', adminSessionCheck, DeleteCoupon)
router.get('/coupons', adminSessionCheck, couponMg)
router.get('/edit-coupon/:id', adminSessionCheck,editCoupon)
router.post('/update-coupon/:id', adminSessionCheck, updateCoupon)




//sales-Report
router.get('/sales-report',adminSessionCheck,salesReportPage)
router.post('/report-download',adminSessionCheck,salesReport);


//logout
router.get("/logout", adminSessionCheck, logout)


//router.get('/category-offers',getAllCategoryOffers)
//router.post('/create-category-offer',createCategoryOffer)
//router.post('/create-category-offer',addCategoryOffer)
// Example route definition
router.post('/create-category-offer', adminSessionCheck, addCategoryOffer);


router.post("/delete-image/:id",  adminSessionCheck, deleteImage)


//router.post('/user-page', adminSessionCheck, userPagination)

















// router.put('/update-order-status/:orderId',updateOrderStatus)
// router.get('/get-order-details/:orderId',ordersucessGet)









//offer management
router.get('/offers',offerPage);
router.get('/offer/product/add',adminSessionCheck, productOfferAddPage);
router.post('/offer/product/add', adminSessionCheck, addProductOffer);
router.delete('/offer/product/:offer_id/delete', adminSessionCheck, deleteProductOffer);
router.get('/offer/category/add', adminSessionCheck, categoryOfferAddPage);
router.post('/offer/category/add',adminSessionCheck, addCategoryOffer);
router.delete('/offer/category/:offer_id/delete', adminSessionCheck, categoryOfferDelete);


module.exports = router;
