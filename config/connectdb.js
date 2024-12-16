const mongoose = require("mongoose");

// Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect();
//     console.log("connection established to database");
//   } catch (error) {
//     console.error(`Error connecting to MongoDB: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const connectDB = async () => {
  await mongoose.connect(
    "mongodb://localhost:27017/authentication"
    // "mongodb+srv://pankaj7559kumar:qMQ74qs2U1yRm9wz@cluster0.jico7.mongodb.net/authentication?retryWrites=true&w=majority&appName=Cluster0"
  );
};
module.exports = connectDB;
