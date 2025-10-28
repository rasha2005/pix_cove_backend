import jwt from "jsonwebtoken";


export default function Auth(req,res,next) {
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.split(" ")[1];
      console.log("authToken",authToken)
    if (!authToken) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
      const verifiedToken = jwt.verify(authToken, process.env.JWT_SECRET);
      console.log("verifiedToken",verifiedToken)
      req.user = verifiedToken;
      next();
}