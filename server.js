var osc = require('node-osc');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 8080;
var oscServer,oscClient;
var checked = [16];

app.get('/',function(req,res){
	res.sendFile(__dirname + '/osc.html');
});

io.on('connection',function(socket){
    console.log("user id : %s",socket.id);
    socket.on("config", function (obj) {
    	io.sockets.emit("update", checked);
    	oscServer = new osc.Server(obj.server.port, obj.server.host);
    	oscClient = new osc.Client(obj.client.host, obj.client.port);
    	oscClient.send('/status', socket.sessionId + ' connected');
    	oscServer.on('message', function(msg, rinfo) {
      		console.log(msg, rinfo);
      		socket.emit("message", msg);
    	});
  });
  
  socket.on("message", function (address,arg1,arg2) {
    	checked[arg1]=arg2;
    	io.sockets.emit("update", checked);
    	oscClient.send(address,arg1,arg2);
  });

  socket.on('disconnect',function(){
		console.log("Disconnect : %s",socket.id);
	});

});

http.listen(PORT,function(){
	console.log('Server listen at port %s',PORT);
});
