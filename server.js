const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
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
  res.redirect('/welcome');
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
      <a href="/auth/login">Login</a>
    `)
  }
  
})
app.post('/auth/login', function(req, res){
  var user = {
    username: 'martin',
    password: '111',
    displayName: 'Martin'
  };
  var uname = req.body.username;
  var pwd = req.body.password;

  //유저 정보가 일치할 경우
  if(uname === user.username && pwd === user.password){
    req.session.displayName = user.displayName;
    res.redirect('/welcome');
  } else {
    res.send('error<a href="/auth/login">login</a>');
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});