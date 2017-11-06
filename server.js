const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');


/**
 * @desc 정적 파일 관리
 */
app.use(express.static('public'));

/**
 * @desc Cookie 사용
 */
app.use(cookieParser('1235dgsdfgi15'));

var products = {
  1: { title:'The history of web 1' },
  2: { title:'The history of web 2' },
  3: { title:'The history of web 3' }
};

app.get('/products', function(req, res){
  var output = '';
  for(var product in products){
    output += `<li><a href="/cart/${product}">${products[product].title}</a></li>`;
  }
  res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">cart</a>`);
});

app.get('/count', function(req, res){
  if(req.signedCookies.count){
    var count = parseInt(req.signedCookies.count);
  } else {
    var count = 0;
  }
  count = count + 1;
  res.cookie('count', count, {signed: true});
  res.send('count : ' + count);
});

app.get('/cart/:id', function(req,res){
  var id = req.params.id;
  if(req.signedCookies.cart){
    var cart = req.signedCookies.cart;
  } else {
    var cart = {};
  }

  if(!cart[id]){ 
    cart[id] = 0;
  }

  cart[id] = parseInt(cart[id])+1;
  res.cookie('cart', cart, {signed: true});
  res.redirect('/cart');
});

app.get('/cart', function(req,res){
  var cart= req.signedCookies.cart;
  if(!cart) {
    res.send('Empty!');
  } else {
    var output = '';
    for(var id in cart){
      output += `<li>${products[id].title} (${cart[id]})</li>`;
    }
  }
  res.send(`
    <h1>Cart</h1>
    <ul>${output}</ul>
    <a href="/products">Products List</a>
  `);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});