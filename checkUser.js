require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: "admin@trashid.com" });
    
    if (user) {
      console.log("------------------------------------------");
      console.log("USER DITEMUKAN!");
      console.log("Email:", user.email);
      console.log("Role :", user.role);
      console.log("Hash Password di DB:", user.password);
      console.log("------------------------------------------");
    } else {
      console.log("USER TIDAK DITEMUKAN di database ini!");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
