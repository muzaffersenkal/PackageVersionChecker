
const mongoose = require('mongoose');

//Connect to Database
module.exports = () => { 
    mongoose.connect(process.env.DB_HOST,{useNewUrlParser: true })
        .then(() => console.log("connected to DB"))
        .catch(e => console.log(e));

}
