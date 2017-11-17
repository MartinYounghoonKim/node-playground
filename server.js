const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const bkfd2Password  = require('pbkdf2-password');
const hasher = bkfd2Password();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root1',
    database: 'study_nodejs'
  })
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/count', function(req, res){
  if(req.session.count){
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('result: ' + req.session.count);
});

app.get('/auth/login', function(req, res){
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
      <p>
        <input type="text" name="username" placeholder="username">
      </p>
      <p>
        <input type="password" name="password" placeholder="password">
      </p>
      <input type="submit"/>
  </form>
  `;
  res.send(output);
});
app.get('/auth/logout', function(req,res){
  req.logout();
  req.session.save( function(){
    res.redirect('/welcome');
  });
})
app.get('/auth/register', function(req, res){
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <input type="submit"/>
  </form>
  `;
  res.send(output);
});
var users = [
  {
    username: 'martin',
    password: 'b98Bc8FJ89kXRiSdlAF929ILmQv4R504mawrt66MCWzCLBbrbrALsvZ8BYtt1xpOboSnvI9ucvjFzQq/9MsJTZuvzI3ruPZ0pgrkMDTPyHaLqELSzJkHj+kIu74dxC5PT2raNdqt9yf98ocZVf7H1nCI0Wuu0KGKHDU8JZste9M=',
    salt: 'xgHB1/YlT24CKyZzi8PJUMbqUlKUdJCTTgmpbaXK+Hc2qGDm3LvENaXRq1aUrT2wenK6vN21Sqr1EX/4dk4Zug==',
    displayName: 'Martin'
  }
]
app.post('/auth/register', function(req, res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var user = {
      username: req.body.username,
      password: hash,
      salt: salt,
      displayName: req.body.displayName
    };
    users.push(user);
    req.login(user, function(err){
      req.session.save(function(){
        res.redirect('/welcome')
      });
    });
  });
  
  
})
app.get('/welcome', function(req,res){
  //로그인 성공시
  if(req.user && req.user.displayName){
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">register</a></li>
      </ul>
      
    `)
  }
  
});
passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(user.username === id){
      return done(null, user);
    }
  }
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    var uname = username;
    var pwd = password;
    for(var i=0; i<users.length; i++){
      var user = users[i];
      if(uname === user.username){
        return hasher({password:pwd, salt:user.salt}, function(err,pass,salt, hash){
          if( hash === user.password) {
            console.log('LocalStrategy', user);
            done(null, user);
          } else {
            done(null, false);
          }
        });
      }
    }
    done(null, false);
  }
));

app.post(
  '/auth/login', 
  passport.authenticate(
    'local', 
    { 
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false 
    }
  )
);
// app.post('/auth/login', function(req, res){
//   var uname = req.body.username;
//   var pwd = req.body.password;
//   for(var i=0; i<users.length; i++){
//     var user = users[i];
//     if(uname === user.username){
//       return hasher({password:pwd, salt:user.salt}, function(err,pass,salt, hash){
//         if( hash === user.password) {
//           req.session.displayName = user.displayName;
//           req.session.save( function(){
//             res.redirect('/welcome');
//           });
//         } else {
//           res.send('error<a href="/auth/login">login</a>');
//         }
//       });
//     }
//   }
  
// });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});