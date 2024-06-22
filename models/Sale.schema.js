const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    drawid: String,
    salenumber: Number,
    addedby:String,
    f:Number,
    s:Number,
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'saleid' });

const User = mongoose.model("Sale", userSchema);
module.exports = User;
