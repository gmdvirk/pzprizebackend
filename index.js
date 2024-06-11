const express = require("express")
const mongoose  =require("mongoose")
const app = express();
const Userrouter = require("./Routes/UserRoutes");
const Drawrouter = require("./Routes/DrawRoutes");
app.use(express.json())
const cors = require("cors")
require("dotenv").config()
app.listen(3001)
app.use(cors({
    origin:'*'
}))

app.use("/user" ,  Userrouter)
app.use("/draw" ,  Drawrouter)

app.get("/" , (req , res)=>{
    res.json({"Meesage":"Hello"})
})

mongoose.connect("mongodb://localhost:27017/prize").then(()=>{
    console.log("Connected")
}).catch(err=>{
    console.log(err)
})