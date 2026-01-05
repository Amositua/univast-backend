import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name,}, 
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // short-lived
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id }, 
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" } // longer-lived
  );
};
