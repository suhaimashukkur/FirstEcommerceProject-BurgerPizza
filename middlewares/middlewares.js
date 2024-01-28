const { User } = require("../model/userSchema");

module.exports.blockChecker = async (req, res, next) => {
  try {
    const user = req.session.user_id;
    //const id = user._id;
    console.log("💕💕💕");
    //console.log(id);
    if (user) {
      const userDb = await User.findOne({ _id: user });

      // if (!userDb) {
      //   throw new Error("User not found");
      // }

      if (userDb.status === true) {
        req.session.destroy();
        res.redirect("/user/blocked");
      } else {
        next();
      }
    }else{
      next()
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.UserLoginChecker = (req, res, next) => {
  if (req.session.user_id && req.session.authenticated) {
    return res.redirect("/home");
  } else {
    next();
  }
};

/*
// Example admin check middleware
module.exports. adminCheckMiddleware = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    // User is an admin, allow access to the admin dashboard
    next();
  } else {
    // User is not an admin, redirect or take other actions
    res.redirect('/login'); // Redirect to login page, for example
  }
};*/


module.exports.userLogedOrNot = async(req,res,next)=>{
  try {
    if(req.session.user_id){
      next()
    }else{
      res.redirect('/register');
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports.adminSessionCheck = (req,res,next)=>{
  try {
    if(req.session.Admin){
      res.redirect('/admin/dash');
     
    }else{
      next();
    }
  } catch (error) {
    
  }
}