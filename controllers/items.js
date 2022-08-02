//Import Dependencies
//Import Models
const Item = require('../models/item');
const User = require('../models/user');

//Initialize router object & express
const router = require('express').Router();

//Router Middleware
router.use(function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/users/login');
    };
});

//Index route-list all logs
//Do you want user homepage to just show user wardrobe items???
router.get('/', (req, res) => {
    Item.find({}, (err, items) => {
        res.render('./items/index.ejs', {
            items,
            name: '',
            user: req.session.user
        });
    });
});

//Filtered Index-only logs from user
router.get('/filtered', (req, res) => {
    User.findById(req.session.user, (err, user) => {
        Item.find({ user: req.session.user }, (err, items) => {
            res.render('./items/index.ejs', {
                items,
                name: `${user.name}`
            });
        });
    });
});

//New Route
router.get('/new', (req, res) => {
    res.render('./items/new.ejs')
});

//Delete Route
router.delete('/:id' , (req,res) => {
    Item.findByIdAndRemove(req.params.id, (err, data) => {
          res.redirect('/items')
    });
});

//Update Route
router.put('/:id', (req,res) => {
    req.body.itemIsFavorite = !!req.body.itemIsFavorite;
    Item.findByIdAndUpdate(req.params.id, req.body, (err, updatedItem) => {
        res.redirect('/items');
    });
});

// Add user favorite. Usea
/**
 * User Favorite
 * Usage:
 * PUT /62e7084ca720544b20f08d97/items/62dc5cbbcceb08d55bb12a04
 * where 08d97 is the userId, 12a04 is the itemId.
 * TODO: Add logic here for whether to $addToSet or $pullAll
 * https://www.mongodb.com/docs/manual/reference/operator/update/pullAll
 *https://www.mongodb.com/docs/manual/reference/operator/update/addToSet
 */
 router.put('/:userId/items/:itemId', (req,res) => {
    const {
        userId,
        itemId,
    } = req.params;
    User.updateOne(
        {
            _id: userId
        },
        {
            '$addToSet': { 'favoriteItems': itemId }
        },
        null,
        () => {
            res.redirect(`/items/${req.params.id}`)
        }
    );
});

//Create Route
router.post('/' , (req,res) => {
    req.body.itemIsFavorite = !!req.body.itemIsFavorite;
    req.body.user = req.session.user;
    Item.create(req.body, (err, createdItem) => {
        res.redirect('/items')
    });
  });

//Edit Route
router.get('/:id/edit' , (req,res) => {
    Item.findById(req.params.id, (err, foundItem)=> {
          res.render('./items/edit.ejs' , {
              foundItem
          });
      });
  });

router.post('/:id/favorite' , (req,res) => {
    console.log('query sent', req.query);


    /**
     * switch off whether we are currently favorited; if we are, do the opposite. this way we can toggle it back and forth.
     e.g.
     POST /items/:id/favorite?isFavorite=true
     or...
     POST /items/:id/favorite?isFavorite=true
     */
    const isCurrentlyFavorited = req.query.isFavorite === 'true'
    const user = req.session.user;
    const userId = user._id;

    if(isCurrentlyFavorited) {
        User.updateOne(
            { _id: userId },
            { $pullAll: { favoriteItems: req.params.id } },
            () => {
                console.log(`user updated! favoriteItems should now not include ${req.params.id}`)
            }
        );
    } else {
        User.updateOne(
            { _id: userId },
            { $push: { favoriteItems: req.params.id } },
            () => {
                console.log(`user updated! favoriteItems should now include ${req.params.id}`)
            }
        );
    }

    res.redirect(`/items/${req.params.id}`);
  });

//Show Route
router.get("/:id", (req,res) => {
    // define a separate variable since we use it more than once
    const itemId = req.params.id;

    const user = req.session.user;

    console.log('user.favoriteItems', user.favoriteItems)
    Item.findById(itemId, (err, foundItem) => {
        const isFavorited = user && user.favoriteItems && user.favoriteItems.includes(itemId) || false;

        res.render('./items/show.ejs', {
            foundItem,
            user: req.session.user,
            isFavorited // add this variable to the view so we can easily use it
        });
    });
});

//Export Router Object
module.exports = router;