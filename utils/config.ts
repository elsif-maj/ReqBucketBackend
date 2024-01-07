require("dotenv").config();

const PORT = process.env.PORT || 5555;
const MONGODB_URI = process.env.MONGODB_URI;

export default {
  PORT,
  MONGODB_URI,
};
