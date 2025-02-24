    const multer = require("multer");

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/'); 
        },
        filename: (req, file, cb) => {
            cb(null, `${req.params.id}_${Date.now()}.jpg`); 
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
    }).array('images', 5); 
    module.exports = upload;
