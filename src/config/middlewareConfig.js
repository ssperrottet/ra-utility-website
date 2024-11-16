// config/middlewareConfig.js
const session = require('express-session');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true,
};

const passportConfig = (passport) => {
    require('../config/passportConfig')(passport);
};

module.exports = { sessionConfig, passportConfig };
