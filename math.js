const addition = (a, b) => {
    return a + b
}

const multiplication = (a, b) => {
    return a * b
}

// default export
// while importing, you can directly use it
// module.exports = addition;

// named export
module.exports = {
    add: addition,
    product: multiplication
}