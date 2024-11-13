const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");

dotenv.config();

const app = express();

// Connect to DB once when the server starts
const connectDB = async () => {
  try {
    // Make sure we're not connecting multiple times
    const connection = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB Connection Successful");
  } catch (err) {
    console.error("DB Connection Error:", err);
    process.exit(1); // Exit the app if the DB connection fails
  }
};

connectDB(); // Establish DB connection

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

// Default route (optional)
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;