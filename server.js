var express = require('express');
var app = express();
var http    = require('http').Server(app);
var io = require('socket.io')(http);

var data = {};

io.on('connection', function(socket){
  console.log("we have a connection");

  socket.on('new-user', function(username){
      data[username] = socket.id;
      io.emit("add-user",data);
  });

  socket.on("new-private-message", function(data_msg){
    io.to(data[data_msg["username"]]).emit("receive-private-message", data_msg);
    console.log(data_msg)
  });

  socket.on("group-message", function(data_msg){
    io.emit("group-message-data", data_msg);
  });

  socket.on("user-is-typing",function(data_msg){
      io.emit("user-is-typing-data", data_msg);
  });


});

http.listen('3000', function(){
  console.log("we are connected");
});
