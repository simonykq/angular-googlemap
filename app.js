var express = require('express');
var app = express();

app.configure(function(){
  app.use('/static', express.static(__dirname + '/src'));
});
app.get('/', function(req,res){
  res.sendfile(__dirname + "/example/angular-ui-map.html");

});

app.listen(8080);