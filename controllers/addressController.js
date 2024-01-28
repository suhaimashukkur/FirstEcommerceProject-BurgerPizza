const { Address } = require("../model/addressSchema");
const{Cart} = require('../model/cartSchema')
const {User} = require('../model/userSchema')
const {Category} = require('../model/categorySchema')
const {Product} = require('../model/productSchema')


module.exports.addAddressPage = async(req,res)=>{
    try {

        res.render('user/address');
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports.addAddress = async (req, res) => {
  try {
    const id = req.session.user_id;

    const userAddres = await Address.findOne({userId: id});
    
   if(userAddres){
      const newAddress = {
        address: req.body.address,
        streetAddress: req.body.streetAddress,
        apartment: req.body.apartment,
        city: req.body.city,
        postcode: req.body.postcode,
        phone: req.body.phone,
        email: req.body.email,
      }

      userAddres.addresses.push(newAddress);
      await userAddres.save();
    }else{
      const newAddress = new Address({
        userId: id,
        addresses: [
          {
            address: req.body.address,
            streetAddress: req.body.streetAddress,
            apartment: req.body.apartment,
            city: req.body.city,
            postcode: req.body.postcode,
            phone: req.body.phone,
            email: req.body.email,
          },
        ],
      });
  
      const saved = await newAddress.save();
      
    }

    return res.redirect('/profile');
 
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.updateAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.id; 
    console.log('Address ID:', addressId);

    const userAddress = await Address.findOne({ userId: userId });
    console.log('User Address:', userAddress);


    if (userAddress) {
      // Find the index of the address in the addresses array based on its _id
      const addressIndex = userAddress.addresses.findIndex(
        (address) => address._id.toString() === addressId
      );

      if (addressIndex !== -1) {
        // Update the specific address based on its index
        userAddress.addresses[addressIndex] = {
          address: req.body.address,
          streetAddress: req.body.streetAddress,
          apartment: req.body.apartment,
          city: req.body.city,
          postcode: req.body.postcode,
          email: req.body.email,
          
        };

        await userAddress.save();
        return res.redirect('/profile');
      } else {
        return res.status(404).send('Address not found');
      }
    } else {
      return res.redirect('/add-address');
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Internal server error');
  }
};


module.exports.deleteAddress = async (req, res) => {
  try {
    const userID = req.session.user_id;
    const id = req.params.id;
    const removed = await Address.findOneAndUpdate(
      { userId: userID },
      { $pull: { addresses: { _id: id } } },
      {new:true}
    );
    console.log(removed);
    if (removed) {
      return res.redirect('/profile');
    } else {
      return res.status(404).json({ error: "Address not found" });
    }
  } catch (error) {
    
    console.error(error.message);
}
};
