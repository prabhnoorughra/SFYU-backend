const { Router } = require("express");
const indexRouter = Router();
const indexController = require("../controllers/indexController");
const authMiddleware = require("../controllers/authMiddleware");
const cors = require("cors");
//cors for enabling cors, will have to filter based on frontend domains during production

const corsOptionsAdmin = {
  origin: process.env.ADMIN_DASHBOARD_URL,
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

//cors for the public STEM site
const corsOptionsAll = {
  origin: [process.env.FRONTEND_URL, "https://stemfellowshipyorku.ca", process.env.ADMIN_DASHBOARD_URL],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

indexRouter.options('/{*splat}', cors(corsOptionsAll));
//for handling more complex requests (i.e. headers, incoming json, put, post, delete etc.)

//populate user if there is a valid jwt
indexRouter.use("/", authMiddleware.populateUser);

/* indexRouter.post("/sign-up", authMiddleware.isNotAuth, indexController.signupPost); */

indexRouter.get("/views", cors(corsOptionsAdmin), indexController.viewHomePageGet);
indexRouter.post("/", cors(corsOptionsAll), indexController.viewHomePagePost);

//login route is not used, may use in the future if we want other executives or members to make accounts
indexRouter.post("/login", cors(corsOptionsAll),authMiddleware.isNotAuth, indexController.loginPost);


indexRouter.post("/adminlogin", cors(corsOptionsAdmin),authMiddleware.isNotAuth, indexController.adminLoginPost);

indexRouter.get("/application", cors(corsOptionsAdmin), authMiddleware.isAuth, authMiddleware.isAdmin, indexController.applicantsGet);
indexRouter.get("/application/count", cors(corsOptionsAdmin), authMiddleware.isAuth, authMiddleware.isAdmin, indexController.applicantCountGet);
indexRouter.post("/application", cors(corsOptionsAll), indexController.applicationPost);

indexRouter.use("/{*splat}", indexController.error404);



module.exports = indexRouter;