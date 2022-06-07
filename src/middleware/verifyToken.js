const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(request, _, next) {
  try {
    const usertoken = request.headers.usertoken;
    const verification = jwt.verify(usertoken, "mycondition");
    request.userTokenInfo = verification;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      console.log("verifyToken: 토큰이 만료되었습니다.");
    } else {
      console.log("verifyToken: 유효하지 않은 토큰입니다.");
    }
    next();
  }
}

module.exports = verifyToken;

// userTokenInfo = {
//   userId: userId,
//   email: email,
//   iat: iat,
//   exp: exp,
//   iss: 'NedX'
// }
