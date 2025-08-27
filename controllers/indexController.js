const { body, validationResult } = require("express-validator");
const validator = require("validator");
const db = require("../db/queries");
const notFoundError = require("../errors/CustomNotFoundError");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const {Role} = require("@prisma/client")
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
        const token = jwt.sign({id: newUser.id, username: newUser.username, role: newUser.role}, 
            process.env.JWT_SECRET, {
            expiresIn: "3d",
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
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    return res.status(200).json({ token });
  })(req, res, next);
};

function adminLoginPost(req, res, next) {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    //error
    if (err)   return next(err);
    //not authenticated
    if (!user) return res.status(401).json({ error: info.message });
    if (user.role != Role.ADMIN) return res.status(401).json({error: "Admins Only"});

    // issue JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '3d' }
    );

    return res.status(200).json({ token });
  })(req, res, next);
};


//
async function applicantsGet(req, res) {
    const search = req.query.search || "";
    const take = +req.query.take || 25;
    const page = +req.query.page || 1;
    const skip = take * (page - 1);
    let emailConsent = req.query.emailConsent;
    if(emailConsent === "true") emailConsent = true;
    if(emailConsent === "false") emailConsent = false;
    if(emailConsent != true && emailConsent != false) {
        emailConsent = null;
    }
    let studyYear = req.query.studyYear;

    if(search) {
        const {applications, total} = await db.searchApplications(search, skip, take, emailConsent, studyYear);
        res.status(200).json({
            applications,
            pagination: {
                page,
                take,
                total,
                totalPages: Math.ceil(total / take)
            }
        });
        return;
    }
    const {applications, total} = await db.getAllApplications(skip, take, emailConsent, studyYear);
    res.status(200).json({
        applications,
        pagination: {
            page,
            take,
            total,
            totalPages: Math.ceil(total / take)
        }
    });
    return;
}

const validateApplication = [
    body("email").trim().isEmail().withMessage("Invalid Email Entered"),
    body("email").custom(value => {
        if(!value.endsWith("@my.yorku.ca")) {
            throw new Error("Not a YorkU Email!")
        }
        return true;
    }), 
    body("email").custom(async (value) => {
        const applicant = await db.findByEmail(value);
        if(applicant) {
            throw new Error("E-Mail is already in use!")
        }
        return true;
    }),
    body("studentId").trim().isNumeric().isLength({min: 9, max: 9}).withMessage("Student ID must be 9 digits long!"),
    body("studentId").custom(async (value) => {
        const applicant = await db.findByStudentId(value);
        if(applicant) {
            throw new Error("StudentId is already in use!")
        }
        return true;
    }),
    body("firstName").trim().isAlpha().withMessage("Invalid Name!"),
    body("lastName").trim().isAlpha().withMessage("Invalid Name!"),
    body("emailConsent").isBoolean({strict: true}).withMessage("Invalid Email preference!"),
    body("program").trim().notEmpty().withMessage("No Program Provided!"),
    body("studyYear").trim().notEmpty().isAscii().withMessage("Invalid Study Year Provided!"),
];

const applicationPost = [validateApplication, async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        //error with application
        return res.status(400).json({errors: errors.array()});
    }
    let {email, studentId, firstName, lastName, emailConsent, program, studyYear} = req.body;
    let fullName = firstName + " " + lastName;
    const applicant = await db.insertApplication(email, studentId, firstName, 
                            lastName, emailConsent, program, studyYear, fullName);
    res.status(201).json(applicant);
    
}];

async function applicantCountGet(req, res) {
    const count = await db.getTotalApplicantCount();
    res.status(200).json({count});
    return;
}

async function viewHomePageGet(req, res) {
    const count = await db.getPageViews("/");
    res.status(200).json({count});
    return;
}

async function viewHomePagePost(req, res) {
    await db.viewPage("/");
    res.status(200).end();
    return;
}

function error404(req, res) {
    /* res.status(404).send("404 Not Found"); */
    throw new notFoundError("404 Not Found");
}




module.exports = {
    error404,
    signupPost,
    loginPost,
    applicantsGet,
    applicationPost,
    applicantCountGet,
    adminLoginPost,
    viewHomePageGet,
    viewHomePagePost
}