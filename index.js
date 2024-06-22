const express = require("express")
const mongoose  =require("mongoose")
const app = express();
const Userrouter = require("./Routes/UserRoutes");
const Drawrouter = require("./Routes/DrawRoutes");
const Paymentrouter = require("./Routes/PaymentRoutes");
app.use(express.json())
const cors = require("cors")
require("dotenv").config()
app.listen(3001)
app.use(cors({
    origin:'*'
}))

app.use("/user" ,  Userrouter)
app.use("/draw" ,  Drawrouter)
app.use("/payment" ,  Paymentrouter)

app.get("/" , (req , res)=>{
    res.json({"Meesage":"Hello"})
})

mongoose.connect("mongodb+srv://i211130:AllahG92@cluster0.t4fkgpc.mongodb.net/prize").then(()=>{
    console.log("Connected")
}).catch(err=>{
    console.log(err)
})