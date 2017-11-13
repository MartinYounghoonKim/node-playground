const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
    password: 'root',
    database: 'o2'
  })
}));

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
  delete req.session.displayName;

  //Database에 session 저장이 끝난 후 실행
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
    req.session.displayName = req.body.displayName;
    req.session.save(function(){
      res.redirect('/welcome')
    });
  });
  
  
})
app.get('/welcome', function(req,res){
  //로그인 성공시
  if(req.session.displayName){
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
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
  
})
app.post('/auth/login', function(req, res){
  var uname = req.body.username;
  var pwd = req.body.password;
  for(var i=0; i<users.length; i++){
    var user = users[i];
    if(uname === user.username){
      return hasher({password:pwd, salt:user.salt}, function(err,pass,salt, hash){
        if( hash === user.password) {
          req.session.displayName = user.displayName;
          req.session.save( function(){
            res.redirect('/welcome');
          });
        } else {
          res.send('error<a href="/auth/login">login</a>');
        }
      });
    }
    // if(uname === user.username && bkfd2Password(pwd+user.salt) === user.password){
    //   req.session.displayName = user.displayName;
    //   return req.session.save( function(){
    //     res.redirect('/welcome');
    //   })
    // } 
  }
  
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});