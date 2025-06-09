const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")
const sanPhamRoute = require("./route/routesanpham")
const donHangRoute = require("./route/routedonhang")

const app = express();
require("dotenv").config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/sanpham", sanPhamRoute);
app.use("/api/donhang", donHangRoute);

app.get("/", (req, res) => {
    res.send("Welcome our chat app APIs..")
});


const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.listen(port, (req, res) => {
    console.log(`Server running on port...: ${port}`);
});

mongoose.connect(uri)
    .then(() => console.log("MongoDB connection established"))
    .catch((error) => console.log("MongoDB connection failed: ", error.message))