const passport = require('passport');

const isAuth = passport.authenticate('jwt', { session: false });

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
const isAdmin = [
  isAuth,
  (req, res, next) => {
    if (req.user && req.user.admin) {
      return next();
    }
    res.status(403).send('Not authorized as admin');
  }
];



module.exports = {
    isAuth,
    isNotAuth,
}