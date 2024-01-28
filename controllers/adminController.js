const { Admin } = require("../model/adminSchema");
const {Category} = require("../model/categorySchema");
const { User } = require("../model/userSchema");
const Coupon = require('../model/couponSchema');
const  Order  = require('../model/orderSchema')
const {Product} = require('../model/productSchema')
const { Address } = require('../model/addressSchema');
const Cart = require('../model/cartSchema');
const CategoryOffer = require("../model/categoryOffer");
const ProductOffer = require("../model/productOffer");
const Chart = require('chart.js');



module.exports.login =  (req,res)=>{
    res.render('admin/login');
}



module.exports.dash = (req,res)=>{
    res.render('admin/dash');

}



   module.exports.verifyAdmin = async (req, res, next) => {
  try {
      const { email, password } = req.body;

      const existingAdmin = await Admin.findOne({ email, password });

      if (existingAdmin) {
          req.session.admin = email;
          req.session.name = true;
          // req.session.save()
          console.log(req.session);
          res.redirect('/admin/dashboard');
      } else {
          
          res.render('admin/login', { errorMessage: 'Username or password incorrect' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports.chartData = async (req, res) => {
  try {
    const orderData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$dateOrdered' },
            month: { $month: '$dateOrdered' }
          },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          orderCount: 1
        }
      },
      {
        $sort: {
          year: 1,
          month: 1
        }
      }
    ]);

    const canceledOrderData = await Order.aggregate([
      {
        $match: {
          canceled: true,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateOrdered' },
          },
          canceledOrderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          canceledOrderCount: 1,
        },
      },
      {
        $sort: {
          year: 1,
        },
      },
    ]);

    const weeklyOrderData = await Order.aggregate([
      {
        $group: {
          _id: {
            week: { $week: '$dateOrdered' },
          },
          weeklyOrderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          week: '$_id.week',
          weeklyOrderCount: 1,
        },
      },
      {
        $sort: {
          week: 1,
        },
      },
    ]);

    res.json({
      orderData,
      canceledOrderData,
      weeklyOrderData,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




/*module.exports.verifyAdmin = async(req,res)=>{
  const admin= new Admin({
    email:req.body.email,
    password:req.body.password
  })
  const adminData= await admin.save();
}*/



module.exports.userManagment = async (req, res) => {
  try {
    const users = await User.find({}); 
    res.render("admin/userManagment", { users: users }); 
  } catch (error) {
    console.log("userManagment try-catch error:", error);
    res.status(500).send('Internal Server Error');
  }
};

// module.exports.getAllCategoryOffers = async (req, res) => {
//   try {
//     const user = await User.find({})
//     const category = await Category.find({});
//     const categoryOffers = await CategoryOffer.find({}).populate('category');
//     res.render('admin/offers', { categoryOffers,category,user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };



// module.exports.createCategoryOffer = async (req, res) => {

//   try {
//     const { category, discountPercentage } = req.body;
//     // Find or create a CategoryOffer for the selected category
//     const categoryOffer = await CategoryOffer.findOneAndUpdate(
//       { category },
//       { discountPercentage },
//       { upsert: true, new: true }
//     );
// if(categoryOffer){
   
//     res.redirect('/admin/offers'); 
// }// Redirect to the offers page
// else{
//   console.log("error")
// }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// };



module.exports.activateUser = async(req,res)=>{
  try {
    const id = req.params.id;

    const user = await User.findOneAndUpdate({_id: id}, {
      $set: 
      {status: true}
    })

    console.log('activated');
    res.redirect('/admin/user-mg');
  } catch (error) {
    console.log(error.message)
  }
}



module.exports.deactivateUser = async(req,res)=>{
  try {
    const id = req.params.id;

    const user = await User.findOneAndUpdate({_id: id}, {
      $set: 
      {status: false}
    })
    console.log('deactivated');
  res.redirect('/admin/user-mg');
  } catch (error) {
    console.log(error.message)
  }
}



 module.exports.deactivateCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const deactivated = await Category.findOneAndUpdate({_id:id},{
      $set: { active: false }
    },
    {new:true});
    console.log(deactivated)

    if (deactivated) {
      req.flash('success', 'Deactivated Category Successfully.');
      res.redirect("/admin/category-mg");
    } else {
      req.flash('success', 'Error deactivating category.');
      console.log('Error deactivating category');
    }
  } catch (error) {
    console.log(error.message);
  }
};


module.exports.activateCategory = async (req, res) => {
  try {
    const id = req.params.id
   console.log(id )
    const activated = await Category.findOneAndUpdate({_id: id}, {
      $set: {active: true}
    })

   if(activated){
    req.flash('success', 'Category Activated Successfully.');
    res.redirect("/admin/category-mg");
   }else{
    req.flash('sucess','error deactivating category')
    console.log('error deactivating category');
   }
  } catch (error) {
   
    console.log(error.message);
}
};


module.exports.userPagination =  async (req, res) => {
  
    try {
      const { page, pageSize } = req.query;
      const skip = (page - 1) * pageSize;
  
      const users = await User.find({})
        .skip(skip)
        .limit(pageSize);
  
      res.json({ users });
    } catch (error) {
      console.error('Error fetching paginated data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }

};




module.exports.addCategoryOffer = async (req, res) => {
  try {
    
      const newOffer = new CategoryOffer({
          offerPercentage: req.body.offerPercentage,
          
          category: req.body.CategoryOffer
      });
      console.log(newOffer)
      

      const savedOffer = await newOffer.save();


      const products = await Product.find({ Category: savedOffer.category });
console.log(products)
      products.forEach((item) => {
          const offerP = item.price * savedOffer.offerPercentage / 100;
          console.log(offerP)
          item.offerGot = offerP
          item.realPrice = item.price;
          item.price = item.price - offerP;
      });

      await Promise.all(products.map((item) => item.save()));

      res.redirect('/admin/dash');
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
}
};

module.exports.logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect('/admin');
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.offerPage = async (req, res, next) => {
  try {
   const category = await Category.find()
   let productOffers = await ProductOffer.find().populate('product_id');
    let categoryOffers = await CategoryOffer.find().populate('category_id');
    res.render('admin/offer', {
      tittle: 'GadgetStore | Offer',
      
      category,
      categoryOffers,
      productOffers,
      message: req.flash(),
    }); 
  } catch (error) {
    next(error);
  }
}


module.exports.productOfferAddPage = async(req, res, next) => {
  try {
    let products = await Product.find().lean();
    console.log(products)
    res.render('admin/add-product-offer', {
      tittle: 'GadgetStore | Product Offer',
      message: req.flash(),
      products
    })
  } catch (error) {
    next(error);
  }

}
module.exports.addProductOffer = async (req, res, next) => {
  try {
    let { product, discount, expiryDate } = req.body;
    let offerProduct = await Product.findOneAndUpdate({ _id: product }, { $set: { haveOffer: true } });
    let discountPrice = (offerProduct.price / 100) * discount;
    let offerPrice = offerProduct.price - discountPrice;
    let productOffer = await ProductOffer.create({
      product_id: product,
      discount,
      offerPrice,
      expiryDate
    });

    if (productOffer) { res.redirect('/admin/offers'); };

  } catch (error) {
    next(error)
  }
}

module.exports.deleteProductOffer = async (req, res, next) => {
  try {
    let offerId = req.params.offer_id;
    let offer = await ProductOffer.findOneAndDelete({ _id: offerId });
    let product = await Product.findOneAndUpdate({ _id: offer.product_id }, { $set: { haveOffer: false } });
    if (product) {
      res.status(200).json({ success: true });
    }
  } catch (error) {
    next(error);
  }
}

module.exports.categoryOfferAddPage = async (req, res, next) => {
  try {
    let categorys = await Category.find().lean();
    res.render('admin/add-category-offer', {
      tittle: 'GadgetStore | Offer Category',
      categorys,
      message:req.flash(),
    })
  } catch (error) {
    next(error);
  }
}

module.exports.addCategoryOffer = async (req, res, next) => {
  try {
    let { category, discount, expiryDate } = req.body;
    await Category.updateOne({ _id: category }, { $set: { haveOffer: true } });
    let categoryOffer = await CategoryOffer.create({
      category_id: category,
      discount,
      expiryDate,
    });

    if (categoryOffer) {
      res.redirect('/admin/offers')
    }

  } catch (error) {
    next(error);
  }
}

module.exports.categoryOfferDelete = async (req, res,next) => {
  try {
    let offerId = req.params.offer_id;
    let categoryOffer = await CategoryOffer.findOneAndDelete({ _id: offerId });
    let category = await Category.findOneAndUpdate({ _id: categoryOffer.category_id }, { $set: { haveOffer: false } });
    
    if (category) { res.status(200).json({ success: true }) };
     
  } catch (error) {
    next(error);
  }
}



