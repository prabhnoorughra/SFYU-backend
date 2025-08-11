const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const notFoundError = require("../errors/CustomNotFoundError");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
//bcrypt for creating the hashed passwords, 
//passport for passport.authenticate, jwt for creating and sending tokens


//example signups and logins and logouts below where username is an email
const validateUser = [
    body("username").trim().isEmail().withMessage("Invalid Email Entered"),
    body("username").custom(async (value) => {
        const user = await db.findUser(value);
        if(user) {
            throw new Error("E-Mail is already in use!")
        }
    }),
    body("password").trim().isLength({min: 10}).withMessage("Password must be at least 10 characters long"),
    body("password").trim().matches(/[a-z]/).withMessage("Password must contain a lowercase letter!"),
    body("password").trim().matches(/[A-Z]/).withMessage("Password must contain a capital letter!"),
    body("password").trim().matches(/\d/).withMessage("Password must contain a number!"),
    body("password").trim().matches(/[^A-Za-z0-9]/).withMessage("Password must contain a symbol!"),
];


const signupPost = [validateUser, async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        //error with signup
        return res.status(400).json({errors: errors.array()});
    }

    let {username, password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.insertUser(username, hashedPassword);
        //user created so now create a JWT
        const token = jwt.sign({sub: newUser.id}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.status(201).json({ token });
    } catch(error) {
        console.error(error);
        next(error);
    }
}];

//jwt logout is handled client side
function loginPost(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    //error
    if (err)   return next(err);
    //not authenticated
    if (!user) return res.status(401).json({ error: info.message });

    // issue JWT
    const token = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ token });
  })(req, res, next);
}

//
function exampleGet(req, res) {
    console.log(req.user);
    res.json({success: true});
}
function error404(req, res) {
    /* res.status(404).send("404 Not Found"); */
    throw new notFoundError("404 Not Found");
}



module.exports = {
    error404,
    signupPost,
    loginPost,
    exampleGet
}