// Needed imports
const express = require('express');
const jwt = require('jsonwebtoken');

// Some variables that will help use keep our code clean
const router = express.Router();
const model = 'users';
const accessTokenSecret = 'aVerySecretAccessToken';
const refreshTokenSecret = 'aVerySecretRefreshToken';
let refreshTokens = [];
const invalidMessage = 'Invalid or expired token, try login in again';
const expiresIn = '3m';

/**
 * Send an JSON error to user
 * @param {*} res the response that will be sent
 * @param {*} message the error message
 * @param {*} code the HTTP status of the error
 * @param {*} error any additional data on the error
 */
const sendError = (res, message, code = 401, error = null) => {
  res.status(code).send({
    code,
    message,
    timestamp: new Date(),
    error,
  });
};

/**
 * Will help us decorate our endpoints as requiring authenticated users.
 * An error will be sent to user if invalid or unauthorized token.
 * @param {*} req the user request
 * @param {*} res the response that will be sent
 * @param {*} next the next step in the filter chain
 */
const authenticateJWT = (req, res, next) => {
  // Looking for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return sendError(res, 'No authorization header found in request');
  }

  // Checking consistency of received header
  const authorization = authHeader.split('Bearer ');
  if (authorization.length !== 2) {
    return sendError(res, 'Invalid authorization token received');
  }

  // Validating received token
  const token = authorization[1];
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return sendError(res, invalidMessage, 403, err);
    }
    req.user = user;
    next();
  });
};

/**
 * Endpoint for creating new access token
 */
router.post('/login', (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  // Looking for user with given username and password
  const user = req.app.db
    .get(model)
    .find({
      username,
      password,
    })
    .value();
  if (!user) {
    // No user, we will just send an error
    return sendError(res, 'Username or password incorrect');
  }
  // User match, we generate a new token
  const accessToken = jwt.sign(
    { username: user.username, role: user.role },
    accessTokenSecret,
    { expiresIn }
  );
  const refreshToken = jwt.sign(
    { username: user.username, role: user.role },
    refreshTokenSecret
  );

  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
  });
});

/**
 * Endpoint for refreshing access token
 */
router.post('/token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return sendError(res, 'No token found in body');
  }

  if (!refreshTokens.includes(token)) {
    return sendError(res, invalidMessage, 403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return sendError(res, invalidMessage, 403);
    }

    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn }
    );

    res.json({
      accessToken,
      refreshToken: null,
    });
  });
});

/**
 * Endpoint for removing a given refresh token
 */
router.post('/logout', (req, res) => {
  const { token } = req.body;
  const oldLength = refreshTokens.length;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  const newLength = refreshTokens.length;
  res.json({
    date: new Date(),
    loggedOut: oldLength > newLength,
  });
});

/**
 * An endpoint for getting current user information
 */
router.get('/whoami', authenticateJWT, (req, res) => {
  const user = req.app.db
    .get(model)
    .find({
      username: req.user.username,
    })
    .value();
  if (!user) {
    return sendError(
      res,
      'Unexpected error when reading token, try login in again'
    );
  }

  res.json(user);
});

exports.authenticateJWT = authenticateJWT;
exports.router = router;
