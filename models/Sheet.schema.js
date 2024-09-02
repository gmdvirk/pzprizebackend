const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    drawid:String,
    sheetname:String,
    addedby:String
}, { timestamps: true });

const User = mongoose.model("Sheet", userSchema);
module.exports = User;
