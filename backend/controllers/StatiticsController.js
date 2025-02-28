const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const getTotalRevenue = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'delivered' }).populate('order_items');
        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

        res.status(200).json({ totalRevenue });
    } catch (error) {
        res.status(500).json({ message: 'Failed to calculate total revenue', error: error.message });
    }
};

const getOrderStatusStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.status(200).json({ stats });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get order status statistics', error: error.message });
    }
};

const getTotalBooksSold = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'delivered' }).populate('order_items');

        const totalProductsSold = orders.reduce((acc, order) => {
            return acc + order.order_items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

        res.status(200).json({ totalProductsSold });
    } catch (error) {
        res.status(500).json({ message: 'Failed to calculate total products sold', error: error.message });
    }
};



const getRevenueByDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const match = { status: "delivered" };

        if (startDate || endDate) {
            match.order_date = {};
            if (startDate) match.order_date.$gte = new Date(`${startDate}T00:00:00.000Z`);
            if (endDate) match.order_date.$lte = new Date(`${endDate}T23:59:59.999Z`);
        }

        const stats = await Order.aggregate([
            { $match: match },

            {
                $lookup: {
                    from: "orderitems", 
                    localField: "order_items",
                    foreignField: "_id",
                    as: "order_items_data"
                }
            },

            { $unwind: "$order_items_data" },

            {
                $group: {
                    _id: { $dateToString: { format: "%d-%m-%Y", date: "$order_date" } },
                    totalRevenue: { $sum: "$total" }, 
                    orderCount: { $sum: 1 }, 
                    totalDiscount: { $sum: "$discount" }, 
                    totalQuantity: { $sum: "$order_items_data.quantity" }, 
                },
            },

            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({ stats });
    } catch (error) {
        console.error("Error in getRevenueByDate:", error);
        res.status(500).json({ message: "Failed to get revenue by date", error: error.message });
    }
};


const getDailyStatistics = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Vui lòng cung cấp month và year" });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const statistics = await Order.aggregate([
            {
                $match: {
                    order_date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$order_date" },
                    totalRevenue: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                    totalDiscount: { $sum: "$discount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(statistics);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

module.exports = {
    getTotalRevenue,
    getOrderStatusStats,
    getTotalBooksSold,
    getRevenueByDate,
    getDailyStatistics
};
