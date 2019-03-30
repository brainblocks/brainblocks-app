/* @flow */
import path from 'path';

import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import router from './routes';

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (process.env.LOGGING === 'true') {
    app.use(logger('dev'));
}

// enable helmet
app.use(helmet());

app.use(cors({
    origin: process.env.WALLET_DOMAIN
}));

// Sets "Referrer-Policy: same-origin".
app.use(helmet.referrerPolicy({
    policy: 'same-origin'
}));

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', process.env.WALLET_DOMAIN);
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);


if (process.env.API_ERRORS === 'true') {
    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        next(createError(404));
    });

    // error handler
    app.use((err, req, res) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

export default app;
