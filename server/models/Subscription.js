const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    repository_id: {
        type: Schema.ObjectId,
        ref: 'Repository',
        required:true
    },
    email: {
        type: String,
        required: true,
    
    },
    createdAt: {
        type: Date,
        default:Date.now
    }
});





module.exports = mongoose.model('subscription',subscriptionSchema);