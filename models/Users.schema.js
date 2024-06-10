const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    address: String,
    contact: String,
    addedby: Number,
    role: String,
    blocked: Boolean
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'userid' });

const User = mongoose.model("User", userSchema);
module.exports = User;
