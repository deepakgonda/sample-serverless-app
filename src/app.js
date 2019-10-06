const express = require('express');
const sls = require('serverless-http');
const createError = require('http-errors');
const path = require('path');
const i18n = require('i18n');

const indexRouter = require('./routes/index');


/**
 * App
 */
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.enable('trust proxy');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.append('Access-Control-Allow-Headers', 'Content-Type, Authorization, XMLHttpRequest, ngsw-bypass');
  next();
});

// i18n
i18n.configure({
  locales: ['en', 'et'],
  defaultLocale: 'en',
  cookie: 'lang',
  objectNotation: true,
  queryParameter: 'lang',
  directory: path.join(__dirname, 'i18n'),
  //updateFiles: true
});
app.use(i18n.init);
// app.get('/en', function (req, res) {
//     // res.cookie('lang', 'en', { maxAge: 900000, httpOnly: false });
//     // res.redirect('back');
// });
// app.get('/et', function (req, res) {
//     // res.cookie('lang', 'et', { maxAge: 900000, httpOnly: false });
//     // res.redirect('back');
// });


/**
 * Routers
 */
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  const error = req.app.get('env') !== 'production' ? err : {};

  res.status(err.status || 500);
  // res.render('error');
  res.json(error);
});


// module.exports.server = sls(app);

const server = sls(app);
module.exports.server = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('Remaining time: ', context.getRemainingTimeInMillis())
  console.log('Function name: ', context.functionName)
  const result = await server(event, context);
  // and here
  return result;
};




// S3
const AWS = require('aws-sdk');

module.exports.webhook = (event, context, callback) => {
  const S3 = new AWS.S3({
    s3ForcePathStyle: true,
    accessKeyId: process.env.S3_ACCESS_KEY_ID, // This specific key is required when working offline
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: new AWS.Endpoint(process.env.S3_END_POINT),
  });
};

// module.exports.s3hook = (event, context) => {
//   console.log(JSON.stringify(event));
//   console.log(JSON.stringify(context));
//   console.log(JSON.stringify(process.env));
// };
