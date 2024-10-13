const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("ws");
const cors = require("cors");
require("dotenv").config();

const Userrouter = require("./Routes/UserRoutes");
const Drawrouter = require("./Routes/DrawRoutes");
const Paymentrouter = require("./Routes/PaymentRoutes");
const Salerouter = require("./Routes/SaleRoutes");
const Reportrouter = require("./Routes/ReportsRoutes");
const { getDrawById } = require("./Controllers/Draw");
const path = require('path');
const { AuthenticateUser } = require("./utils");

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use("/user", Userrouter);
app.use("/draw", Drawrouter);
app.use("/payment", Paymentrouter);
app.use("/sale", Salerouter);
app.use("/report", Reportrouter);

// app.get("/", (req, res) => {
//     res.json({ "Message": "Hello" });
// });
// Serve static files from the React app
// app.use(express.static(path.join(__dirname, './client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build', 'index.html'));
});
mongoose.connect("mongodb+srv://i211130:AllahG92@cluster0.t4fkgpc.mongodb.net/prizetest")
    .then(() => {
        console.log("Connected to replica set");
    })
    .catch(err => {
        console.log("Error: ", err);
    });



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
