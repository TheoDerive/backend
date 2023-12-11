const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name: String,
    image: String,
    content: Array
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
