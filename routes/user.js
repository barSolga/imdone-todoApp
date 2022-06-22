const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const Todo = require('../models/todo')
const User = require('../models/user');
require('dotenv').config();

// authentication
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Must be logged in to do it!');
        res.redirect('/user/login');
    }
}

// user account routes
router.route('/register')
    .get((req, res) => {
        res.render('register', { 
            bodyClass: 'index',
            title: 'Register', 
        });
    })
    .post((req, res) => {

        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        req.checkBody('username', 'You have to provide username').notEmpty();
        req.checkBody('email', 'You have to provide email').notEmpty();
        req.checkBody('email', 'Email is wrong').isEmail();
        req.checkBody('password', 'Password cant be empty').notEmpty();
        req.checkBody('passwordTwo', 'You must repeat password').notEmpty();
        req.checkBody('password', 'Passwords not identical').equals(req.body.passwordTwo);
        req.checkBody('passwordTwo', 'Passwords not identical').equals(req.body.password);

        let errors = req.validationErrors();

        if(errors) {
            errors.forEach(error => {
                req.flash('danger', error.msg);
            })
            res.redirect('/user/register');
        } else {
            let query = {username: username};
            User.findOne(query, (err, user) => {
                if(err) throw err;
                if(!user) {
                    let newUser = new User();
                        newUser.username = username;
                        newUser.email = email;
                        newUser.password = password;
                        
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) {
                                console.log(err);
                            }
                            newUser.password = hash;
                            newUser.save((err) => {
                                if(err) {
                                    console.log(err);
                                    return
                                } else {
                                    console.log('success', 'User added');
                                }
                            })
                        });
                    }); 
                    req.flash('success', 'Pomyślnie dodano użytkownika');
                    res.redirect('/user/login');
                } else {
                    req.flash('danger', 'Użytkownik już istnieje');
                    res.redirect('/user/register');
                }
            });
        }

    });

// login
router.route('/login')
    .get((req, res) => {
        res.render('login', { 
            bodyClass: 'index',
            title: 'Login', 
        });
    })
    .post((req, res, next) => {
        const login = req.body.username;
        const password = req.body.password;

        req.checkBody('username', '<i class="bx bxs-error"></i> Username is required!').notEmpty();
        req.checkBody('password', '<i class="bx bxs-error"></i> Password is required!').notEmpty();

        let errors = req.validationErrors();

        if(errors) {
            res.render('login', { 
                title: 'Login', 
                errors: errors,
            });
        } else {
            passport.authenticate('local', {
                successRedirect: '/user/todo',
                failureRedirect: '/user/login',
                failureFlash: true,
                successFlash: true,
            })(req, res, next);
        }
    });


router.get('/todo', ensureAuthenticated, (req, res) => {
    Todo.find({uId: req.user._id}, (err, todos) => {
        if (err) return handleError(err);
        else {
            res.render('dashboard', { 
                bodyClass: 'dashboard',
                title: 'Users TODO', 
                todos: todos,
            });
        }
    });
});

// POST of user todo
router.post('/todo', ensureAuthenticated, (req, res) => {
    const body = req.body.todobody;
    const desc = req.body.tododesc;
    const priority = req.body.priority;

    req.checkBody('todobody', 'TODO title must be provided!').notEmpty();
    req.checkBody('priority', 'Choose TODO priority!').notEmpty();

    let errors = req.validationErrors();

    if(errors) {
        errors.forEach(error => {
            req.flash('danger', error.msg);
        })
        res.redirect('/user/todo');
    } else {
        let newTODO = new Todo();
        newTODO.date = new Date();
        newTODO.uId = req.user._id;
        newTODO.body = body;
        newTODO.description = desc;
        newTODO.priority = priority;
        newTODO.isDone = false;
        newTODO.save(function (err) {
            if (err) return handleError(err);
            else {
                console.log('Todo added successfully');
                req.flash('success', 'Task added successfully!')
                res.redirect('/user/todo');
            }
        });
    }
});

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Todo.find({uId: req.user._id}, (err, tasks) => {
        res.render('todoEdit', {
            bodyClass: 'dashboard',
            title: 'Users TODO edit', 
            todos: tasks,
            idTodo: req.params.id,
        });
    });
});

router.post('/edit/:id', ensureAuthenticated, (req, res) => {
    Todo.findByIdAndUpdate(req.params.id, { body: req.body.todobody, priority: req.body.priority, description: req.body.tododesc}, (err, task) => {
        if(err) return res.send(500, err);
        if (task.uId != req.user._id) {
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }
        else {
            console.log('todo edited nicely');
            req.flash('success', 'Task has been edited!')
            res.redirect('/user/todo');
        }
    });
});

router.get('/done/:id', ensureAuthenticated, (req, res) => {
    Todo.findByIdAndUpdate(req.params.id, { isDone: true, priority: -1 }, (err, task) => {
        if(err) return res.send(500, err);
        if (task.uId != req.user._id) {
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }
        else {
            console.log('todo marked as done');
            req.flash('success', 'NICELY DONE!')
            res.redirect('/user/todo');
        }
    });
});

router.get('/undone/:id', ensureAuthenticated, (req, res) => {
    Todo.findByIdAndUpdate(req.params.id, { isDone: false, priority: 0 }, (err, task) => {
        if(err) return res.send(500, err);
        if (task.uId != req.user._id) {
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }
        else {
            console.log('todo marked as done');
            req.flash('success', 'You can do it better!')
            res.redirect('/user/todo');
        }
    });
});

router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    let query = {_id:req.params.id};

    Todo.findById(req.params.id, (err, task) => {
        if (task.uId != req.user._id) {
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        } 
        else {
            Todo.deleteOne(query, (err) => {
                if(err) {
                    console.log(err);
                }
                req.flash('success', 'Task has been deleted!')
                res.redirect('/user/todo');
            });
        }
    });
});

// Logout
router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success', 'Logged out successfully!');
    res.redirect('/');

});



module.exports = router;