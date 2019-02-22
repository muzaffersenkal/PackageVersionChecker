const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const repositorySchema = new Schema({
    
    url: {
        type: String,
        required: true,
    
    },
    owner: {
        type: String,
        required: true,
    
    },
    repository: {
        type:String,
        required: true,
    },
    packages: {
        type: Array
    },
    packageType: {
        type: String
    },
    createdAt: {
        type: Date,
        default:Date.now
    }
});





module.exports = mongoose.model('repository',repositorySchema);