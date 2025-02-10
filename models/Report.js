const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
    year: String,
    month: String,
    daysOverdue: Number
});

const creditAccountSchema = new mongoose.Schema({
    accountNumber: String,
    bank: String,
    accountType: String,
    openDate: String,
    status: String,
    creditLimit: Number,
    currentBalance: Number,
    amountOverdue: Number,
    paymentHistory: String,
    paymentHistoryDetails: [paymentHistorySchema]
});

const reportSchema = new mongoose.Schema({
    basicDetails: {
        name: String,
        pan: String,
        dob: String,
        phone: String,
        creditScore: String
    },
    accountSummary: {
        totalAccounts: Number,
        activeAccounts: Number,
        closedAccounts: Number,
        defaultAccounts: Number,
        totalBalance: {
            secured: Number,
            unsecured: Number,
            total: Number
        }
    },
    creditAccounts: [creditAccountSchema],
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);
