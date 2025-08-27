const express = require("express");
const request = require("supertest");
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
const prisma = require("../db/prisma");

//for parsing formdata and/or incoming json data into req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const indexRouter = require("../routes/indexRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);


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


// Every thrown error in the application or the previous middleware function calling 
// `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
  console.error(err);
  // We can now specify the `err.statusCode` that exists in our custom error class 
  // and if it does not exist it's probably an internal server error
  res.status(err.statusCode || 500).json({error: err.message});
});


//Tests
const testUser = "prabhnoor.ughra@gmail.com"
const testAdmin = "psughra@uwaterloo.ca"
let adminToken = null;
const invalidToken = "123456";

describe("admin login route", function() {
    test("failed login", done => {
        request(app)
            .post("/adminlogin")
            .send({username: testUser, password: "123"})
            .expect(401, done)
    })
    test("successful login", done => {
        request(app)
            .post("/adminlogin")
            .send({username: testAdmin, password: process.env.PASSWORD})
            .expect('Content-Type', /json/)
            .expect(res => {
                expect(res.body).toHaveProperty('token');
                adminToken = res.body.token;
            })
            .expect(200, done)
    })
});

describe("page views", function() {
    test("unauthorized get views", done => {
        request(app)
            .get("/views")
            .expect(res => {
                expect(res.body).toHaveProperty('count');
                expect(res.body.count).toBe(0);
            })
            .expect(200, done)
    })
    test("authorized get views", done => {
        request(app)
            .get("/views")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('count');
                expect(res.body.count).toBe(0);
            })
            .expect(200, done)
    })
    test("post to main page to increment views", done => {
        request(app)
            .post("/")
            .expect(200, done)
    })
    test("get updated views", done => {
        request(app)
            .get("/views")
            .expect(res => {
                expect(res.body).toHaveProperty('count');
                expect(res.body.count).toBe(1);
            })
            .expect(200, done)
    })
});

describe("application tests", function() {
    test("unauthorized get application count", done => {
        request(app)
            .get("/application/count")
            .expect(401, done)
    })
    test("authorized get application count", done => {
        request(app)
            .get("/application/count")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('count');
                expect(res.body.count).toBe(0);
            })
            .expect(200, done)
    })
    test("unauthorized get applications", done => {
        request(app)
            .get("/application")
            .expect(401, done)
    })
    test("authorized get applications", done => {
        request(app)
            .get("/application")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('applications');
                expect(res.body.applications.length).toBe(0);
            })
            .expect(200, done)
    })
    test("invalid application post", done => {
        request(app)
            .post("/application")
            .send({email: "invalid@gmail.com", studentId: "1234"})
            .expect(res => {
                expect(res.body).toHaveProperty('errors');
                expect(res.body.errors.length).toBe(8);
            })
            .expect(400, done)
    })
    test("authorized get application count", done => {
        request(app)
            .get("/application/count")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('count');
                expect(res.body.count).toBe(0);
            })
            .expect(200, done)
    })
    test("authorized get applications", done => {
        request(app)
            .get("/application")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('applications');
                expect(res.body.applications.length).toBe(0);
            })
            .expect(200, done)
    })
    test("valid application post", done => {
        request(app)
            .post("/application")
            .send({
                    email: "psughra@my.yorku.ca", 
                    studentId: "123456789",
                    firstName: "Prabhnoor",
                    lastName: "Ughra",
                    emailConsent: true,
                    program: "Computer Science",
                    studyYear: "Third",
                })
            .expect(res => {
                expect(res.body.email).toBe("psughra@my.yorku.ca");
                expect(res.body.studentId).toBe("123456789");
                expect(res.body.firstName).toBe("Prabhnoor");
                expect(res.body.lastName).toBe("Ughra");
                expect(res.body.emailConsent).toBe(true);
                expect(res.body.program).toBe("Computer Science");
                expect(res.body.studyYear).toBe("Third");
            })
            .expect(201, done)
    })
    test("authorized get application count", done => {
        request(app)
            .get("/application/count")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('count');
                expect(res.body.count).toBe(1);
            })
            .expect(200, done)
    })
    test("authorized get applications", done => {
        request(app)
            .get("/application")
            .set("Authorization", `Bearer ${adminToken}`)
            .expect(res => {
                expect(res.body).toHaveProperty('applications');
                expect(res.body.applications.length).toBe(1);
            })
            .expect(200, done)
    })
});

describe("unknown route requests", function() {
    test("404 on unknown routes", done => {
        request(app)
            .get("/unknown")
            .expect(404, done)
    });
    test("404 on unknown routes", done => {
        request(app)
            .get("/")
            .expect(404, done)
    });
    test("404 on unknown routes", done => {
        request(app)
            .put("/unknown")
            .expect(404, done)
    });
    test("404 on unknown routes", done => {
        request(app)
            .post("/unknown")
            .expect(404, done)
    });
    test("404 on unknown routes", done => {
        request(app)
            .del("/unknown")
            .expect(404, done)
    });
});

