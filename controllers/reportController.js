const Report = require('../models/Report');
const { parseXMLReport } = require('../services/xmlParser');

const processXMLReport = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No XML file uploaded' });
        }

        console.log('File received:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        const xmlContent = req.file.buffer.toString('utf-8');
        console.log('XML Content (first 500 chars):', xmlContent.substring(0, 500));

        const parsedData = await parseXMLReport(xmlContent);
        console.log('Parsed Data:', JSON.stringify(parsedData, null, 2));

        const report = new Report({
            basicDetails: parsedData.basicDetails,
            accountSummary: parsedData.accountSummary,
            creditAccounts: parsedData.creditAccounts,
            uploadedAt: new Date()
        });

        console.log('Report Model:', JSON.stringify(report.toObject(), null, 2));

        const savedReport = await report.save();
        console.log('Saved Report ID:', savedReport._id);
        res.status(201).json(savedReport);
    } catch (error) {
        console.error('Error processing XML report:', error);
        console.error('Error stack:', error.stack);
        next(error);
    }
};

const getReport = async (req, res, next) => {
    try {
        console.log('Getting report with ID:', req.params.id);
        const report = await Report.findById(req.params.id);
        console.log('Found report:', report);
        
        if (!report) {
            console.log('Report not found in database');
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        next(error);
    }
};

const getAllReports = async (req, res, next) => {
    try {
        console.log('Fetching all reports');
        const reports = await Report.find()
            .select('basicDetails uploadedAt')
            .sort({ uploadedAt: -1 });
        console.log('Found reports:', reports.length);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        next(error);
    }
};

module.exports = {
    processXMLReport,
    getReport,
    getAllReports
};
