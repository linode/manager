const auth = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['x-auth-token'];

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  req.token = token;
  return next();
};

export default auth;
