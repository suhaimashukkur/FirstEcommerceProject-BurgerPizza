const { Otp } = require("../model/otpSchema");
const { User } = require("../model/userSchema");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { Product } = require("../model/productSchema");
const { Category } = require("../model/categorySchema");
const {Address}=require("../model/addressSchema");
const { findOne } = require("../model/cartSchema");
const {Wallet} = require('../model/walletSchema')
const  CategoryOffer  = require('../model/categoryOffer')
const ProductOffer = require('../model/productOffer')


module.exports.profile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const category = await Category.find({active:true})
    const wallet = await Wallet.find({userId:id})
    // Assuming you want to find the address associated with the user
    const address = await Address.findOne({userId: id});
console.log(address)
    const user = await User.findById(id);

    if (!user) {
      // Handle the case where the user is not found
      console.error('User not found');
      return res.status(404).send('User not found');
    }

    // Render the user profile view with the retrieved user information
    res.render('user/profile', { user: user, addresses: address ,category:category,wallet:wallet});
  } catch (error) {
    console.error('Error in profile controller:', error.message);
    res.status(500).send('Internal Server Error');
  }
};

module.exports.editAddress = async(req,res) => {
  try{
       const id = req.session.user_id;
       const userAddress = await Address.findOne({userId:id})
       if(userAddress){
        res.render('user/editAddress',{address:userAddress.addresses[0]})
       }else{
        res.status(400).send("address not found")
       }

  }catch(error){
    console.error(error.message)
    res.status(500).send("internal server eroor")
  }
}

module.exports.editProfile = async(req,res) => {
  try{
    const id = req.session.user_id;
    const user = await User.findById(id).exec();
    if(!user){
      res.status(500).send("user not found")
    }
    res.render('user/editProfile',{user:user})
  }catch(error){
    console.error(error.message)
    res.status(500).send('internal server error')
  }
}


module.exports.wallet = async (req, res) => {
  try {
    const id = req.session.user_id;
    const user = await User.findById(id);
    const wallet = await Wallet.find({userId:id})
    const category = await Category.find({})

    if (!wallet) {
      return res.status(404).send("Wallet not found");
    }

    return res.render('user/wallet', { wallet: wallet,user:user,category:category });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Internal server error');
  }
};


module.exports.editAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.id; // Assuming the address ID is passed as a parameter

    const userAddress = await Address.findOne({ userId: userId });

    if (userAddress) {
      const addressToEdit = userAddress.addresses.find(
        (address) => address._id.toString() === addressId
      );

      if (addressToEdit) {
        return res.render('user/editAddress', { address: addressToEdit });
      } else {
        return res.status(400).send('Address not found');
      }
    } else {
      return res.status(400).send('Address not found');
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).send('Internal server error');
  }
};


module.exports.updateProfile = async(req,res) => {
  try{
    const id = req.session.user_id;
    const user = await User.findById(id);
    if(!user){
      return res.status(500).send("invalid user")
    }
    const newProfile = await User.updateOne(
      {_id:id},
      {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone
      }
    )
    res.redirect('/profile')

  }catch(error){
    console.error(error.message)
  }
}



module.exports.loginUser = (req, res) => {
  let userAlertmsg;
    if(req.query.message){
userAlertmsg=req.query.message;
    }
  res.render("user/login",{userAlertmsg});
};


module.exports.signupUser = (req, res) => {
  let userAlertmsg;
    if(req.query.message){
userAlertmsg=req.query.message;
    }
  res.render("user/signup",{userAlertmsg,success:req.flash()});
};


const generateOtp = () => {
  return otpGenerator.generate(6, { uppercase: false, specialChars: false });
};

const sendVerifyMail = async (fullname, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "suhaimashukkur@gmail.com",
        pass: "kxon mdpm qhvc tgbs",
      },
    });
    const mailOptions = {
      from: "suhaimashukkur@gmail.com",
      to: email,
      subject: "For Verification Mail",
      html: `<p>Hi ${fullname},Your OTP:${otp}</p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent:", info.response);
        console.log(otp);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports.signup = async (req, res) => {
  try {
      const { name, email, phone, password } = req.body;

      // Check if the email already exists
      const checkEmail = await User.findOne({ email: email });

      if (checkEmail) {
        res.redirect('/register?message=email already exists');
      } else {
          // Store address details in an array
          const addresses = [{
              fullName: req.body.addressFullName,
              houseAddress: req.body.addressHouse,
              locality: req.body.addressLocality,
              district: req.body.addressDistrict,
              pincode: req.body.addressPincode
          }];

          // Save user details to the session for verification
          req.session.registerEmail = email;
          req.session.otp = generateOtp();
          req.session.userDetails = { name, email, phone, password, addresses };

          // Send verification email
          sendVerifyMail(name, email, req.session.otp);
          

          // Redirect to OTP page
          req.flash('success', 'signup successful!');
          res.redirect(`/loadOtpPage?resend=${email}&name=${name}`);
      }
  } catch (error) {
   
      console.log(error.message);
  }
};


module.exports.verifyOtp = async (req, res) => {
  try {
      const userDetails = req.session.userDetails;
      const otp = req.body.otp;

      // Validate OTP
      if (otp === req.session.otp) {
          // Hash the password
          const hashedPass = await bcrypt.hash(userDetails.password, 10);

          // Create a new user with addresses
          const user = new User({
              name: userDetails.name,
              email: userDetails.email,
              phone: userDetails.phone,
              password: hashedPass,
              addresses: userDetails.addresses,
              otp: req.session.otp
          });

          // Save the user
          const userData = await user.save();
          req.flash('success', 'Signup  successful!');
          // Redirect to login page or perform other actions
          res.redirect('/login');
      } else {
        req.flash('success', 'signup not successful!');
        // res.render('OtpPage',{error:"Invalid Otp"})
         // res.status(400).send('Invalid OTP');
         //return res.json({ success:false });
      }
  } catch (error) {
      console.log('Verify-otp try catch error:', error.message);
  }
};


module.exports.login = (req, res) => {
  res.render("user/login");
};

module.exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.find({});

    res.render("user/userForgotPass", { user: user });
  } catch (error) {
    console.log(error.message);
  }
};



module.exports.verifyLogin = async (req, res) => {
  try {
    const password = req.body.password;
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        if (user.status === true) {
          req.session.destroy();
          req.flash('error', 'Your account is blocked.');
          return res.redirect('/user/blocked');
        }

        req.session.user_id = user._id;
        req.session.authenticated = true;
        req.flash('success', 'Login successful!');
        console.log(req.flash('success')); // Check if success flash message is logged

        const products = await Product.find().populate('category');
        return res.redirect('/home');
      } else {
        req.flash('error', 'Incorrect username or password.');
        return res.redirect('/login');
      }
    } else {
      req.flash('error', 'Incorrect username or password.');
      return res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};





module.exports.home = async (req, res) => {

  const user = req.session.user_id;
  const categoryoffer = await CategoryOffer.find().lean() 
  const productoffer = await ProductOffer.find().lean();
  const category = await Category.find({ active: true });
  const product = await Product.find().populate("category");

  //const cart = await Cart.findOne({ userId: userId }).populate('items.product');
   
 
    res.render("user/home", { category: category, user: user ,product:product,categoryoffer:categoryoffer,productoffer});
  
};

module.exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

module.exports.userBlocked = (req, res) => {
  res.render("user/userBlockPage");
};


module.exports.renderForgotPassword = (req, res) => {
  res.render("user/forgotPassword",({ messages: req.flash() })); // Create an EJS template for the forgot password form
};


module.exports.sendPasswordResetEmail = async (req, res) =>{
  try {
    const emailDb = req.body.email;
    const user = await User.findOne({ email: emailDb });

    if (user) {
      // Generate a unique token (e.g., using a library like 'uuid' or any token generator)
      const resetToken = generateOtp(); // You can customize this for a more secure token
      req.session.otp = resetToken;
      console.log("New OTP:", resetToken);
      console.log("hello");
      sendVerifyMail(user.name, user.email, resetToken);

      user.otp = resetToken;
      await user.save();
     
      res.render("user/resetPassword", { user: user });
    }
  } catch (error) {
    console.log(error.message);
    // Handle errors and render an error view template if needed
  }
};



module.exports.addNewPassword = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    if (user) {
      user.password = hashPassword;
      const saved = await user.save();
      console.log(user);

      if (saved) {
        res.redirect("/login");
      } else {
        console.log("New password not saved !");
      }
    } else {
      console.log("user not found");
    }
  } catch (error) {
    console.log(error.message);
  }
};




// Add this function
module.exports.renderPasswordReset = async (req, res) => {
   try {
       // Validate the token and render the password reset page
       res.render('user/resetPassword',req.success());
   } catch (error) {
       console.log(error.message);
   }
};



// Add this function
module.exports.handlePasswordReset = async (req, res) => {
  try {
    const id = req.params.id; // Assuming this is the user's ID

    // Find the user by ID
    const user = await User.findOne({ _id: id });
console.log("is user her",user)
    if (user) {
      const email = req.body.email;
      const getotp = req.body.otp;
      const otp = req.session.otp;
      
      if (email && otp == getotp) {
        
        res.render("user/newPasswordAdd", { user });
      } else {
        req.flash('error', 'Incorrect username or password.');
       // res.status(400).send("Invalid email or OTP.");
      }
    } else {
      res.status(404).send("User not found.");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.resendOtp2 = async (req, res) => {
  try {
    const email = req.query.email;
    const name = req.query.name;

    // Delete existing OTP records associated with the email
    await Otp.deleteMany({ email: email });

    const generateOtp2 = () => {
      return otpGenerator.generate(6, {
        uppercase: false,
        specialChars: false,
      });
    };

    // Generate a new OTP
    const otp2 = generateOtp2();

    // Find the user by email
    const findUser = await User.findOne({ email: email });

    if (!findUser) {
      console.log("User not found with email:", email);
      return res.status(404).json({ error: "User not found with the given email." });
    }

    // Save the new OTP in the database
    const otpDb = new Otp({
      email: email,
      otp: otp2,
    });
    await otpDb.save();

    console.log("Generated OTP:", otp2);

    // Send the verification email and wait for it to complete
    await sendVerifyMail(findUser.name, email, findUser._id, otp2);

    // Render the page after all asynchronous operations are completed
    res.render("user/otpPage", { data: { email, name } });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).json({ error: "An error occurred while resending OTP." });
  }
};
module.exports.otpPage = async(req,res)=> {
  try {
    
    const name = req.query.name,
     resend = req.query.resend;


res.render("user/otpPage", {  resend, name  });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).json({ error: "An error occurred while rendering otp page." });
  }
}

module.exports.verifyresendOtp = async(req,res)=> {
  try {
    const email = req.query.email,
    name = req.query.name,
    userDetails = req.session.userDetails

    otpForResend = generateOtp()
    req.session.otp = otpForResend

    sendVerifyMail(name,email,otpForResend);

    res.redirect(`/loadOtpPage?resend=${email}&name=${name}`)

  } catch (error) {
    console.error("Error while resending OTP:", error);
    res.status(500).json({ error: "An error occurred while resending OTP." });
  }
}


module.exports.changePassword = async(req,res) => {
  try{
    const id = req.session.user_id;
    const user = await User.findById(id).exec();
    if(!user){
      res.status(400).send('user not found')
    }
    res.render('user/changePassword',{user:user})
  }catch(error){
    console.error(error.message)
  }
}


