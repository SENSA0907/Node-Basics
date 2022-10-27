const multer  = require('multer')

const imageFilterFunction = (req, file, cb) => {
    // in cb, i need to pass true or false
    // true --> when file format is correct
    // false --> when file format is incorrect
    if (file.mimetype === 'application/json')  {
        cb(null, true)
    } else {
        cb('Please select only json', false)
    }
}

const upload = multer({
    fileFilter: imageFilterFunction
});

module.exports = upload;