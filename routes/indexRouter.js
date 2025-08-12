const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController");
const authMiddleware = require("../controllers/authMiddleware");
const cors = require("cors");
//cors for enabling cors, will have to filter based on frontend domains during production

const corsOptions = {
  origin: "*",
  //when we have our specific frontends that we want to allow you will need to make it
  //an array of the links to them, i.e. origin: ['https://my-frontend.com','https://another-frontend.com']
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

indexRouter.options('/{*splat}', cors(corsOptions));
//for handling more complex requests (i.e. headers, incoming json, put, post, delete etc.)

//populate user if there is a valid jwt
indexRouter.use("/", authMiddleware.populateUser);

/* indexRouter.post("/sign-up", authMiddleware.isNotAuth, indexController.signupPost); */

indexRouter.post("/login", authMiddleware.isNotAuth, indexController.loginPost);

indexRouter.get("/application", cors(corsOptions), authMiddleware.isAuth, authMiddleware.isAdmin, indexController.applicantsGet);
indexRouter.get("/application/count", cors(corsOptions), authMiddleware.isAuth, authMiddleware.isAdmin, indexController.applicantCountGet);
//cors middleware used here
indexRouter.post("/application", cors(corsOptions), indexController.applicationPost);

indexRouter.get("/{*splat}", indexController.error404);



module.exports = indexRouter;