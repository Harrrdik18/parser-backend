const express = require('express');
const multer = require('multer');
const { processXMLReport, getReport, getAllReports } = require('../controllers/reportController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/xml' || file.originalname.endsWith('.xml')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only XML files are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post('/upload', upload.single('xmlFile'), processXMLReport);
router.get('/:id', getReport);
router.get('/', getAllReports);

module.exports = router;
