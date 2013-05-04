var express = require('express');
var app = express();

app.configure(function(){
  app.use('/static', express.static(__dirname + '/src'));
});
app.get('/', function(req,res){
  res.sendfile(__dirname + "/example/angular-ui-map.html");

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
