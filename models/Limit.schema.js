const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    drawid: String,
    userid: String,
        hindsaa:Number,
        hindsab:Number,
        akraa:Number,
        akrab:Number,
        tendolaa:Number,
        tendolab:Number,
        panogadaa:Number,
        panogadab:Number
}, { timestamps: true });

const User = mongoose.model("Limit", userSchema);
module.exports = User;
