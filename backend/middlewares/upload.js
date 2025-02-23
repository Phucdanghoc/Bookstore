    const multer = require("multer");

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/'); 
        },
        filename: (req, file, cb) => {
            cb(null, `${req.params.id}_${Date.now()}.jpg`); // Tên file = ID sách
        },
    });
    const upload = multer({
        storage,
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Invalid file type'), false);
            }
            cb(null, true);
        },
    }).array('images', 5); // Tối đa 5 ảnh
    module.exports = upload;
