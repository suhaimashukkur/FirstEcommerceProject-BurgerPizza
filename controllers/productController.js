const { Category } = require("../model/categorySchema");
const { Product } = require("../model/productSchema");
const { CategoryOffer } = require('../model/categoryOffer')
const {ProductOffer } = require('../model/productOffer')
const fs = require('fs')


module.exports.productPage = async (req, res) => {
  const product = await Product.find().populate("category");
  res.render("admin/product-mg", { items: product });
};

module.exports.categoryPage = async (req, res) => {
  const category = await Category.find({});
  res.render("admin/category-mg", { category: category });
};


// Route for admin product listing with pagination

module.exports.pagination =  async (req, res) => {
  try {
    const { page, pageSize } = req.body;
    const skip = (page - 1) * pageSize;
    
   // const products = await Product.find()
   const products = await Product.find({})
      .skip(skip)
      .limit(pageSize);

    res.json({ products });
  } catch (error) {
    console.error('Error fetching paginated data:', error);
    res.status(500).json({ error: 'Internal Server Error'});
}
};


module.exports.productSort= async (req, res) => {
  try {
    const sortOption = req.query.sort || 'name'; // Default to sorting by name if no option provided

    let products = await Product.find().sort(sortOption).exec();

    products = products.slice(0, 10);

    res.send({ payload: products });
  } catch (error) {
    console.log("Error in productSort route");
    console.log(error.message);
    res.status(500).send({ error: 'Internal Server Error' });
}
};


module.exports.productPaginate =  async (req, res) => {
  try {
    
      const { page, pageSize } = req.body;

      const products = await Product.find()
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .populate('category', 'categoryName')
          .exec();

      const totalProducts = await Product.countDocuments();
      const totalPages = Math.ceil(totalProducts / pageSize);

      res.json({ products, totalPages });
  } catch (error) {
      console.error('Error fetching paginated product list:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports.addCategory = async (req, res) => {
  try {
    const categoryNew = req.body.category;

    console.log("Received category:", categoryNew);
    req.flash('success', 'New Category Added.');

    const existingCategory = await Category.findOne({
      categoryName: categoryNew,
    });
    const category = await Category.find({});

    // if (existingCategory) {
    //   console.log("Category already exists.");
    //   return res.status(400).send("Duplicate category found");
    // }
    if (existingCategory) {
      console.log("Category already exists.");
      return res.render('admin/category-mg', {category: category, success: "Duplicate category found" });
    }


    const categorySave = new Category({
      categoryName: categoryNew,
    });

    const saved = await categorySave.save();

    if (saved) {
      console.log("New Category Added.");
      return res.redirect("/admin/category-mg");
    } else {
      console.log("Error saving category.");
      return res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.log("Category-add try-catch error!");
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};


module.exports.categoriesLoad = async (req, res) => {
  const id = req.params.id;
  const user = req.session.user_id;
  
    const category = await Category.find({ active: true });
    const product = await Product.find({ category: id }).populate("category");
    res.render("user/categoriesCollection", {
      product: product,
      category: category,
      user: user
    })
};


module.exports.editCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await Category.findOne({ _id: id });

    if (category) {
      res.render("admin/editCategoryPage", { category: category,success:req.flash() });
    } else {
      console.log("category not found !");
    }
  } catch (error) {
    console.log(error.message);
  }
};



module.exports.updateCategory = async (req, res) => {
  try {
    const catId = req.params.id;
    const newCategoryName = req.body.categoryName;

    // Check if the new category name already exists
    const existingCategory = await Category.findOne({ categoryName: newCategoryName });

    if (existingCategory) {
      req.flash('success', 'Duplicate category name.');
      return res.redirect("/admin/category-mg");
    }

    // If the category name is unique, proceed with the update
    const editCategory = await Category.findByIdAndUpdate(
      catId,
      {
        $set: {
          categoryName: newCategoryName,
        },
      },
      { new: true }
    );

    if (editCategory) {
      req.flash('success', 'Category updated successfully.');
      res.redirect("/admin/category-mg");
    } else {
      req.flash('success', 'Category not found.');
      res.redirect("/admin/category-mg");
    }
  } catch (error) {
    console.error(error.message);
    req.flash('success', 'Internal Server Error.');
    res.redirect("/admin/category-mg");
  }
};


module.exports.singleProductView = async (req, res) => {
  try {
    var id = req.params.id;
    
    if (req.session.user_id) {
      const category = await Category.find({ active: true });
      const product = await Product.findById(id);
      res.render("user/singleProduct", {
        product: product,
        category: category,
        user: true,
      });
    } else {
      const category = await Category.find({ active: true });
      const product = await Product.findOne({ _id: id });
      res.render("user/singleProduct", {
        product: product,
        category: category,
        user: false,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};


module.exports.AddProductPage = async (req, res) => {
  const category = await Category.find({});
  res.render("admin/addProductPage", { category: category });
};


module.exports.addProduct = async (req, res) => {
  try {
    const productData = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      description: req.body.description,
      image1:
        req.files[0] && req.files[0].filename ? req.files[0].filename : "",
      image2:
        req.files[1] && req.files[1].filename ? req.files[1].filename : "",
      stock: req.body.stock,
    });

    await productData.save();
    msg = "New Product Added";
    console.log("hlooo", { msg: msg });

    return res.redirect("/admin/product-mg");
  } catch (error) {
   
    console.log(error.message);
  }
};


module.exports.EditProductPage = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send("Invalid product ID");
    }
    const category = await Category.find({});
    const product = await Product.findById(id).exec();
    if (!product) {
      res.status(404).send("Product not found");
    }

    // console.log(categories)
   res.render("admin/editProductPage", {
      title: "Edit User",
      product: product,
      admin: true,
      category,
      
    });
  } catch (error) {
    
    console.log(error.message);
  }
};


module.exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send("Invalid product ID");
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      req.flash('success', 'Product not found.');
      return res.status(404).send("Product not found");
    }

    let new_image1 = existingProduct.image1;
    let new_image2 = existingProduct.image2;


    if (req.files[0] || req.files[1]) {
      new_image1 =
        req.files[0] && req.files[0].filename ? req.files[0].filename : "";
      new_image2 =
        req.files[1] && req.files[1].filename ? req.files[1].filename : "";
      try {
        await fs.unlink(path.join("./uploads", existingProduct.image1));
        await fs.unlink(path.join("./uploads", existingProduct.image2));
      } catch (err) {
        
        console.error(err);
      }
    }

    const newData = await Product.updateOne(
      { _id: id },
      {
        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        image1: new_image1,
        image2: new_image2,
        stock: req.body.stock,
      }
    );

    console.log(newData);
    req.flash('success', 'Product updated successfully.');
    res.redirect("/admin/product-mg");
  } catch (error) {
    console.log("Try catch error in updateProduct ");
    console.log(error.message);
  }
};


module.exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await Product.findByIdAndDelete(id).exec();

    if (product && product.image1 && product.image2) {
      try {
        fs.unlinkSync("./uploads/" + product.image1);
        fs.unlinkSync("./uploads/" + product.image2);
      } catch (err) {
        console.error(err);
      }
    }
    req.flash('success', 'Product deleted successfully.');

    res.redirect("/admin/product-mg");
  } catch (error) {
    
    console.log(error.message);
  }
};





module.exports.deleteImage = async (req, res) => {
  try {
   let imgId = req.body.imageId;
   let prodId = req.body.productId;

   console.log(imgId + "📀📀📀📀" + prodId);

   const product = await Product.findOne({_id: prodId});
   console.log(product)

   if(product){
    var imgIndex = product.images.findIndex((index)=> index._id.toString() === imgId);
    console.log(imgIndex)

    try {
      const deleteimage = path.join(__dirname, '../public/uploads/'+ product.images[imgIndex].url);
      fs.unlinkSync(deleteimage)
    } catch (error) {
      console.log(error.message);
    }
   }


   product.images.splice(imgIndex,1);

   res.send(imgId)

   await product.save();
  } catch (error) {
    console.log("Try catch error in deleteImage 🤷‍♂️📀🤷‍♀️");
    console.log(error.message);
  }
};




module.exports.allproducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('user/allproducts', { products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
};


module.exports.productFilter = async (req, res) => {
  try {
    const filterOption = req.query.category; // Retrieve the category ID from the query

    let products;
    if (!filterOption) {
      // If no category filter is applied, return all products
      products = await Product.find().exec();
    } else {
      // Filter products based on the category ID
      products = await Product.find({ category: filterOption }).exec();
    }
    
    products = products.slice(0, 10);
    
    res.send({ payload: products });
    
  } catch (error) {
    console.log("Error in productFilter route");
    console.log(error.message);
    res.status(500).send({ error: 'Internal Server Error'});
  }
};


module.exports.searchProducts = async (req, res) => {
  try {
    const payload = req.body.payload.trim(); 
    const search = await Product.find({
      name: { $regex: new RegExp( payload, "i") }, 
    }).limit(10); // Limit the search results

    console.log(search);
    res.json({ payload: search });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
