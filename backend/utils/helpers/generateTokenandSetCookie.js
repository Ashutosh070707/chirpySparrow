import jwt from "jsonwebtoken";

// creates a cookie in response which stores userId of loggedInUser. lifetime = 15 days
const generateTokenandSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict", //CSRF
  });

  return token;
};

export default generateTokenandSetCookie;
