var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', {
      'title': 'Register',
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', {
      'title': 'Login',
    });
});

router.post('/register', function(req, res, next){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    if(req.files && req.files.profileImage){
        console.log("upload file");

        //file info
        var profileImageOriginalName = req.file.profileimage.originalname;
        var profileImageName = req.file.profileimage.name;
        var profileImageMime = req.file.profileimage.mimetype;
        var profileImagePath = req.file.profileimage.path;
        var profileImageExt = req.file.profileimage.extension;
        var profileImageSize = req.file.profileimage.size;
    }else{
        var profileImageName = 'noimage.png';
    }

  // form Validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Name not valid').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Password do not math').equals(req.body.password);

  // check for erros
  var errors = req.validationErrors();
  if(errors){
    res.render('register',{
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  }else{

    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageName
    });
    //create user
    User.createUser(newUser, function(err, user){
      if(err) throw err;
        console.log(user);
    });

    req.flash('sucess', 'Voce foi registrado com sucesso');

    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done){
    User.getUserByUsername(username, function(err, user){
      if(err) throw err;
      if(!user){
        console.log('unknown user');
        return done(null, false, {message: 'unknown user'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else{
          console.log('Invalid Password');
          return done(null, false, {message: 'Invalid Password'});
        }
      })
    });

  }
));

router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}), function(req, res){
  console.log('authentication Successful');
  req.flash('sucess', 'You are logged in');
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('sucess', 'You have logged out');
  res.redirect('/users/login');
});

module.exports = router;
