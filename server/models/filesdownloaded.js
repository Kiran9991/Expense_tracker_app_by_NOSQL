const mongoose = require('mongoose');

const downloadedFileSchema = new mongoose.Schema({
    urls: String
});

const DownloadedFile = mongoose.model('DownloadedFile', downloadedFileSchema);

module.exports = DownloadedFile;
