const Sales = require('../model/salesSchema');
const { Category } = require("../model/categorySchema");
const Order= require('../model/orderSchema'); 
const {User} = require('../model/userSchema')



module.exports.salesReportPage = async(req,res)=>{

   try{
     const category = await Category.find({ active: true });
     const user = await User.find();
     const orders = await Order.find().populate('userId').populate('items.product');

    console.log(orders)
    res.render('admin/salesReport',{category,order:orders,user});
   }
   catch(error){
    console.log(error.message);
    console.log('try catch error in salesreportpage');
   }
  }





module.exports.salesReport = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId').populate('items.product');
    const startDateString = req.body.startDate;
    const endDateString = req.body.endDate;

    if (!startDateString || !endDateString) {
      return res.status(400).send('Start date and end date are required.');
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    endDate.setHours(23, 59, 59, 999); // Set the end time to 23:59:59.999

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send('Invalid date format. Please provide valid dates.');
    }

    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    // Adjust the query to filter orders within the specified date range
    const allOrders = await Order.find({
      dateOrdered: { $gte: startDate, $lte: endDate },
      returned: false,
    });

    console.log('Filtered Orders:', allOrders);

    let totalSales = 0;
    let totalOrders = 0;

    allOrders.forEach((order) => {
      totalSales += order.totalAmount;
      totalOrders++;
    });

    const averageOrderValue = totalOrders > 0 ? Math.ceil(totalSales / totalOrders) : 0;

    const salesReport = {
      totalSales,
      totalOrders,
      averageOrderValue,
      orders: allOrders.map((order) => ({
        orderId: order._id.toString(),
        totalAmount: order.totalAmount,
        status: order.status,
        address: order.address,
        username:order.address,
        

        paymentMethod:order.paymentMethod,
        formattedDateOrdered : order. formattedDateOrdered
      })),
    };

    res.send(salesReport);

  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};