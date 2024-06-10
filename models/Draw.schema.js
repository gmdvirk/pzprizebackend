const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    title: String,
    time: String,
    onedigita: String,
    onedigitb: String,
    twodigita: String,
    twodigitb: String,
    threedigita: String,
    threedigitb: String,
    fourdigita: String,
    fourdigitb: String,
    fivedigita: String,
    fivedigitb: String,
    status: Boolean
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'drawid' });

const User = mongoose.model("Draw", userSchema);
module.exports = User;
