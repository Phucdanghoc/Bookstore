const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const getTotalRevenue = async (req, res) => {
    try {
        const orders = await Order.find({ status: 'completed' }).populate('order_items');
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
        const orders = await Order.find({ status: 'completed' }).populate('order_items');

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

        const match = {};
        if (startDate) match.order_date = { $gte: new Date(startDate) };
        if (endDate) {
            match.order_date = match.order_date || {};
            match.order_date.$lte = new Date(endDate);
        }

        const stats = await Order.aggregate([
            { $match: { ...match, status: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$order_date' } },
                    totalRevenue: { $sum: '$total' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({ stats });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get revenue by date', error: error.message });
    }
};

module.exports = {
    getTotalRevenue,
    getOrderStatusStats,
    getTotalBooksSold,
    getRevenueByDate,
};
