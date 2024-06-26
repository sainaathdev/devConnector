const mongoose = require("mongoose")
const config = require("config")

const db = config.get("mongoURI")

const connectDb = async ()=>{
    try {
        await mongoose.connect(db)
        console.log("MongoDB Connected!!!")
    } catch (err) {
        console.error(err.message)
        process.exit(1) //process exit with failure
    }
}

module.exports = connectDb;