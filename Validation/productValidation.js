const validateAddProduct = (req, res, next) => {
    console.log(req.body)
    const { title, price, description } = req.body;
    if (!title || !price || !description) {
        return res.status(400).json({
            message: "Price or Title or Description is missing in Request Body"
        })
    } else if (price < 0) {
        return res.status(400).json({
            message: "Price should be greater than 0"
        })
    }
    next();
}

module.exports = {
    validateAddProduct: validateAddProduct
}