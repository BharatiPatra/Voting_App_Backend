const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },

  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["voter", "admin"],
    default: "voter",
  },
  isVoted: {
    type: Boolean,
    default: false,
  },
});
userSchema.pre("save", async function (next) {
  const user = this;
  //hash the password only if it has been modifies (or is new)
  if (!user.isModified("password")) return next();

  try {
    //hash password generation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    //override the plain password with the hashed one
    //console.log("Hashed Password in Hook:", hashedPassword); $2b$10$FD1WbPETGjs.AK2zdvBtYOg9zvxzxyZZflrTz81Qdq/u2Kf8LvytK after the password change  $2b$10$COz4HjuQGkkH/0A7R1lRmO6JmLFSXONLYKjCTjMKdt./sY0mLTW1y

    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // console.log('Candidate Password:', candidatePassword); amit@123
    // console.log('Stored Hashed Password:', this.password); $2b$10$FD1WbPETGjs.AK2zdvBtYOg9zvxzxyZZflrTz81Qdq/u2Kf8LvytK
    //use bcrypt to comparethe provided  password with the hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password Match:", isMatch); //true

    return isMatch;
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
