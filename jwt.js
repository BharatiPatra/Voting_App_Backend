const jwt = require("jsonwebtoken");
const jwtAuthMiddleware = (req, res, next) => {
  //first check req headers has authorization or not
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Invalid token" });
  //extract the jwt token from the req headers
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    //verify jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Attach user info to the req object
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Inavalid token" });
  }
};

//fun to generate JWT token
const generateToken = (userData) => {
  //generate a new jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET); //sometime when u use {expiresIn:30} it will cause pbm so we pass proper object so write {userData} instead of userdata
};
module.exports = { jwtAuthMiddleware, generateToken };
