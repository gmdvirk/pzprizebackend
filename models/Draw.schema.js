const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    title: String,
    time: String,
    date:String,
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
    soldonedigita: String,
    soldonedigitb: String,
    soldtwodigita: String,
    soldtwodigitb: String,
    soldthreedigita: String,
    soldthreedigitb: String,
    soldfourdigita: String,
    soldfourdigitb: String,
    soldfivedigita: String,
    soldfivedigitb: String,
    status: String,
    firstprize:String,
    secondprize1:String,
    secondprize2:String,
    secondprize3:String,
    secondprize4:String,
    secondprize5:String,
    addedby: Number,
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'drawid' });

const User = mongoose.model("Draw", userSchema);
module.exports = User;
