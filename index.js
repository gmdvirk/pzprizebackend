// cluster.js

const cluster = require('cluster');
const os = require('os');

const numWorkers = 10; // Number of worker processes

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    // Listen for dying workers and replace them
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker.`);
        cluster.fork();
    });

} else {
    // Worker processes have their own copies of the server
    const express = require("express");
    const mongoose = require("mongoose");
    const http = require("http");
    const { Server } = require("ws");
    const cors = require("cors");
    const path = require('path');
    const dotenv = require("dotenv");
    dotenv.config();

    const Userrouter = require("./Routes/UserRoutes");
    const Drawrouter = require("./Routes/DrawRoutes");
    const Paymentrouter = require("./Routes/PaymentRoutes");
    const Salerouter = require("./Routes/SaleRoutes");
    const Reportrouter = require("./Routes/ReportsRoutes");
    const { getDrawById } = require("./Controllers/Draw");
    const { AuthenticateUser } = require("./utils");

    const app = express();
    const server = http.createServer(app);
    const wss = new Server({ server });

    // Middleware
    app.use(express.json());
    app.use(cors({ origin: '*' }));

    // Routes
    app.use("/user", Userrouter);
    app.use("/draw", Drawrouter);
    app.use("/payment", Paymentrouter);
    app.use("/sale", Salerouter);
    app.use("/report", Reportrouter);

    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, './client/build')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, './client/build', 'index.html'));
    });

    // MongoDB Connection
    const mongoURI = process.env.MONGODB_URI || "mongodb+srv://i211130:AllahG92@cluster0.t4fkgpc.mongodb.net/prizetest";

    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`Worker ${process.pid}: Connected to MongoDB`);
    })
    .catch(err => {
        console.error(`Worker ${process.pid}: MongoDB connection error:`, err);
        process.exit(1); // Exit if unable to connect to MongoDB
    });

    // WebSocket Server
    wss.on('connection', (ws) => {
        console.log(`Worker ${process.pid}: New WebSocket connection`);

        ws.on('message', (message) => {
            console.log(`Worker ${process.pid} received: ${message}`);
            // Handle incoming messages
        });

        ws.send('Welcome to the WebSocket server!');
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`Worker ${process.pid}: Server is running on port ${PORT}`);
    });
}
