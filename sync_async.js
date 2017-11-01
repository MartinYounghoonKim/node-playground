var fs = require('fs');

//Sync - 동기 방식
console.log(1);
var syncData = fs.readFileSync('data.txt', {encoding: 'utf8'});
console.log(syncData);

//Async - 비동기 방식
console.log(2);
var asyncData = fs.readFile('data.txt', {encoding: 'utf8'}, function(err, result){
	console.log(3);
	console.log(result + 1)
});
console.log(4);