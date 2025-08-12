const express = require("express");
const app = express();
const path = require("node:path");
require("dotenv").config();

//authentication/jwt imports
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require("bcryptjs");
//db prisma
const prisma = require("./db/prisma");

//for parsing formdata and/or incoming json data into req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//passport auth setup for logins
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username: username,
        }
      });

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

// JwtStrategy for protecting endpoints
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey:    process.env.JWT_SECRET,
};
passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique(
      { where: { 
          id: payload.id 
        },
        select: {
          id: true,
          username: true,
          role: true,
        }
      }
    );
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

//routes
const indexRouter = require("./routes/indexRouter");


app.use("/", indexRouter);



// Every thrown error in the application or the previous middleware function calling 
// `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
  console.error(err);
  // We can now specify the `err.statusCode` that exists in our custom error class 
  // and if it does not exist it's probably an internal server error
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server Listening At Port: ${PORT}`);
})