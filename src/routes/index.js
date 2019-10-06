var express = require('express');
var router = express.Router();

const usersRouter = require('./users');

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.json({ app: 'Serverless Express App' });
});

/**
 * Routers
 */
router.use('/users', usersRouter);
module.exports = router;
