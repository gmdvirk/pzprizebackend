const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    newpassword: String,
    address: String,
    contact: String,
    haddaloud:Boolean,
    addedby: [String],
    key:String,
    role: String,
    blocked: Boolean,
    upline:Number,
    payment:{
        cash:{ type: Number, required: true},
        credit:{ type: Number, required: true},
        balanceupline:{ type: Number, required: true},
        availablebalance:{ type: Number, required: true, default: 0},
    },
    comission:{
        comission:Number,
        pcpercentage:Number,
    },
    limit:{
        drawid:String,
        hindsaa:Number,
        hindsab:Number,
        akraa:Number,
        akrab:Number,
        tendolaa:Number,
        tendolab:Number,
        panogadaa:Number,
        panogadab:Number,
        },
    prize:{
        prizea:Number,
        prizeb:Number,
        prizec:Number,
        prized:Number,
    },
    purchase:{
        plimitaf:Number,
        plimitas:Number,
        plimitbf:Number,
        plimitbs:Number,
        plimitcf:Number,
        plimitcs:Number,
        plimitdf:Number,
        plimitds:Number,
    }
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'userid' });

const User = mongoose.model("User", userSchema);
module.exports = User;
