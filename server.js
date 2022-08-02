//Dependencies
require('dotenv').config();
const express = require('express');
//const expressLayouts = require ('express-ejs-layouts');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const itemsRouter = require('./controllers/items');
const session = require('express-session');
const usersController = require('./controllers/users');
const port = process.env.PORT || "3000"


//Initialize Express App
const app = express();

//Configure App Settings
const { MONGO_URL, PORT, SECRET } = process.env;
mongoose.connect(MONGO_URL);
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB')
});

//Mount Middleware
app.use(express.urlencoded({ extended: false })); 
app.use(express.static('public'));
//app.use(expressLayouts)
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(session({ //session middleware
    secret: SECRET, 
    resave: false, 
    saveUninitialized: false
}));
app.use(async function (req, res, next) {//created middlware-user to res.local object
    if (req.session && req.session.user) {
        const user = await require('./models/item').findById(req.session.user)
        res.locals.user = user;
    } else {
        res.locals.user = null;
    }
    next();
});

//Mount Routes
app.get('/', (req, res) => {
    //res.send('<h1>Hola</h1>')
    res.redirect('/items')
});

app.use('/items', itemsRouter);
app.use('/users', usersController);

//Listen on PORT
app.listen(PORT, () => {
    console.log(`Express is listening for request on port: ${PORT}`)
});
