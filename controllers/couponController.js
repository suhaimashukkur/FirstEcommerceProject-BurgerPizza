const {Coupon} = require('../model/couponSchema')
const {Order }= require('../model/orderSchema'); 
const { User } = require('../model/userSchema');
const { Category } = require("../model/categorySchema");
const Cart = require('../model/cartSchema');
const { Address } = require('../model/addressSchema');
var couponCode = require('coupon-code')


module.exports.generateCoupon = async(req,res)=>{
    try {
        let codeC = couponCode.generate({parts: 2});
    
        res.send({coupon: codeC })
    } catch (error) {
        console.log('Try catch error in generateCoupon 🤷‍♂📀🤷‍♀');
        console.log(error.message);
    }
};


module.exports.couponMg = async(req,res)=>{
    try {
    const coupons = await Coupon.find();

    res.render("admin/coupons", {coupons: coupons})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports.addCouponPage = async(req,res)=>{
    try {
        res.render('admin/addCoupon',{success:req.flash()})
    } catch (error) {
         console.log(error.message)
    }
}

module.exports.addCoupon = async(req,res)=>{
    try {
        const newCoupon = new Coupon({
            couponCode: req.body.code,
            expirationDate: req.body.expiryDate,
            discountPercentage: req.body.discountPercentage,
            maxPrice: req.body.maxPrice,

        })

        const saveCoupon = newCoupon.save();

        if(saveCoupon){
            req.flash('success', 'New Coupon Added.');
            res.redirect('/admin/coupons');
        }else{
            console.log('coupon saving failed');
        }
    } catch (error) {
        console.log(error.message)
    }
}



module.exports.editCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            console.log('Coupon not found');
            res.redirect('/admin/coupons');
            return;
        }
         res.render('admin/editCoupon', { coupon: coupon });
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.redirect('/admin/coupons');
    }
};


module.exports.updateCoupon = async(req,res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        console.log(coupon)

        if (!coupon) {
            console.log('Coupon not found');
            req.flash('success', 'Coupon not found.');
            res.redirect('/admin/coupons');
            return;
        }

        // Update the coupon in the database with the new data
        coupon.couponCode = req.body.code;
        coupon.expirationDate = new Date(req.body.expiryDate);

        coupon.discountPercentage = req.body.discountPercentage;
        console.log(req.body);
        await coupon.save();
        console.log(coupon)
        if(coupon){
            req.flash('success', 'Coupon Updated Successfully.');
            
        res.redirect('/admin/coupons');
      
        }
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.redirect('/admin/coupons');
    }
}




module.exports.DeleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;

        // checking deletion confirmation
        if (req.query.confirmation === 'true') {
            const deleteCoupon = await Coupon.findOneAndDelete({ _id: id });

            if (deleteCoupon) {
                req.flash('success', 'Coupon deleted successfully.');
                res.redirect('/admin/coupons');
            } else {
                console.log('Error deleting coupon');
                res.redirect('/admin/coupons'); 
            }
        } else {
            
            console.log('Deletion canceled by user');
            res.redirect('/admin/coupons'); 
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/coupon'); 
}
};


// Find and update coupons that have expired
const checkAndUpdateExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        const coupons = await Coupon.find({ expirationDate: { $lte: currentDate }, expired: false });

        if (coupons.length > 0) {
            const expiredCoupons = await Coupon.updateMany(
                { _id: { $in: coupons.map(coupon => coupon._id) } },
                { $set: { expired: true } }
            );

            if (expiredCoupons) {
                console.log("Coupons expired:", expiredCoupons.nModified);
            }
        } else {
            console.log("No coupons found that have expired.");
        }
    } catch (error) {
        console.error("Error checking and updating expired coupons:", error);
    }
};



//-------------------------- USER SIDE ---------------------------------------|>


module.exports.useCoupon = async (req, res) => {
    try {
        const newCode = await Coupon.findOne({ couponCode: req.body.couponCode });
     

        checkAndUpdateExpiredCoupons();


       if(!newCode.active){
        res.send({used: 'coupon already used'});
       }else{
        if(!newCode){
            res.send({invalid: "Invalid coupon code"});

        }else if (!newCode.active && newCode.expired){
            
            res.send({expired: 'Coupon Expired'})
        } else {
            const perc = newCode.discountPercentage;
            res.send({ code: perc });

          const  couponExpired =  await Coupon.updateOne({ _id: newCode._id }, { $set: { active: false } });
        }
       }
       if (newCode.maxPrice !== null && orderTotal > newCode.maxPrice) {
        res.send({ invalid: 'Order total exceeds maximum price limit for this coupon.' });
        return;
    }

    } catch (error) {
        console.log('Try catch error in useCoupon ');
        console.log(error.message);
    }
};


module.exports.coupons = async (req, res) => {
    try {
    
        const user = req.session.user._id
        const coupons = await Coupon.find({});
        checkAndUpdateExpiredCoupons();


        if(coupons.startDate < coupons.expirationDate){
         const expired = await Coupon.updateMany({expired: true});
         if(expired){
            console.log("coupon expired !!..");
         }
        }


        const category = await Category.findOne({categoryName: 'BURGER'});

        

        const headCategory = await getCategory();
        res.render('user/coupons', {coupons: coupons, headCategory, user: user})
    } catch (error) {
        console.log('Try catch error in coupons ');
        console.log(error.message);
}
};


module.exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ active: true, expirationDate: { $gt: new Date() } });

        res.json({ coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'Internal Server Error' });
}
};