const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    date: String,
    category: String,
    isLarge: Boolean,
    isTall: Boolean
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
