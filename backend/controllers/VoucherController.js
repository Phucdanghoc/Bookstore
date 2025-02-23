const Voucher = require('../models/Voucher');

// Create a new voucher
const createVoucher = async (req, res) => {
    try {
        const { code, discount, expired_date, min_order_value, status = 'active' } = req.body;

        const existingVoucher = await Voucher.findOne({ code });
        if (existingVoucher) {
            return res.status(400).json({ message: 'Voucher code already exists' });
        }

        const newVoucher = new Voucher({
            code,
            discount,
            expired_date,
            min_order_value,
            status,
        });

        const savedVoucher = await newVoucher.save();
        res.status(201).json({ message: 'Voucher created successfully', voucher: savedVoucher });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create voucher', error: error.message });
    }
};

const getVouchers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = '', expired = false } = req.query;

        const query = {};
        if (status) query.status = status;
        if (expired) query.expired_date = { $lt: new Date() };

        const vouchers = await Voucher.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const totalVouchers = await Voucher.countDocuments(query);

        res.status(200).json({
            vouchers,
            totalVouchers,
            totalPages: Math.ceil(totalVouchers / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch vouchers', error: error.message });
    }
};
const searchVouchers = async (req, res) => {
    try {
        const { search = '', limit = 10, page = 1, status = '' } = req.query;

        let filter = { code: new RegExp(search, 'i') };

        if (status && status !== '') {
            filter.status = status;
        }

        const vouchers = await Voucher.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalVouchers = await Voucher.countDocuments(filter);
        const totalPages = Math.ceil(totalVouchers / limit);

        res.status(200).json({
            vouchers,
            totalVouchers,
            totalPages,
            currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to search vouchers', error: error.message });
    }
};

const getVouchersByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const voucher = await Voucher.findOne({ code });
        console.log(voucher);

        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        res.status(200).json(voucher);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch the voucher', error: error.message });
    }
};


// Update a voucher
const updateVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discount, expired_date, status } = req.body;

        const updatedVoucher = await Voucher.findByIdAndUpdate(
            id,
            { code, discount, expired_date, status },
            { new: true }
        );

        if (!updatedVoucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.status(200).json({ message: 'Voucher updated successfully', voucher: updatedVoucher });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update voucher', error: error.message });
    }
};

// Delete a voucher
const deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedVoucher = await Voucher.findByIdAndDelete(id);

        if (!deletedVoucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }

        res.status(200).json({ message: 'Voucher deleted successfully', voucher: deletedVoucher });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete voucher', error: error.message });
    }
};

const validateVoucher = async (req, res) => {
    try {
        const { code } = req.body;

        const voucher = await Voucher.findOne({ code });

        if (!voucher) {
            return res.status(404).json({ message: 'Invalid voucher code' });
        }

        if (voucher.status !== 'active') {
            return res.status(400).json({ message: 'Voucher is not active' });
        }

        if (new Date() > new Date(voucher.expired_date)) {
            return res.status(400).json({ message: 'Voucher has expired' });
        }

        res.status(200).json({ message: 'Voucher is valid', voucher });
    } catch (error) {
        res.status(500).json({ message: 'Failed to validate voucher', error: error.message });
    }
};

module.exports = {
    createVoucher,
    getVouchers,
    updateVoucher,
    deleteVoucher,
    validateVoucher,
    getVouchersByCode,
    searchVouchers,
};
