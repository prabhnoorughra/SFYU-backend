const passport = require('passport');
const { Role } = require('@prisma/client')

function populateUser(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
}

function isAuth(req, res, next) {
  if(!req.user) {
    return res.status(401).json({message: "Please log in"});
  } else {
    next();
  }
}

/**
 * Only allow if NOT authenticated.
 * If a valid JWT is presented, we block (403).
 * Otherwise continue.
 */
function isNotAuth(req, res, next) {
  // look for Bearer token
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    // no token → not authenticated → OK
    return next();
  }
  // there *is* a token: verify it via passport
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) {
      // they’re already logged in → block access
      return res.status(403).send('Already authenticated');
    }
    // invalid token → treat as not auth’d
    next();
  })(req, res, next);
}


/** Example of role checking
 * Admin‐only: first require a valid JWT, then check user.admin.
 * If you prefer, you can also inline this in your routes as [isAuth, isAdmin].
 */
function isAdmin(req, res, next) {
  if(req.user && req.user.role === Role.ADMIN) {
    return next();
  } else {
    return res.status(403).json({message: "You are not an Administrator!"});
  }
}



module.exports = {
    isAuth,
    isNotAuth,
    populateUser,
    isAdmin,
}