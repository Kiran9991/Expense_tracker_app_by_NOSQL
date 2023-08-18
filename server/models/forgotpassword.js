const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresby: Date
});

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema);

module.exports = ForgotPassword;
