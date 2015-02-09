var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 8080;

app.get('/',function(req,res){
	//request : son cabeceras y datos que nos envia el navegador.
	//response : son todo lo que enviamos desde el servidor.
	res.sendFile(__dirname + '/index.html');
});

io.on('connection',function(socket){
	console.log("user id : %s",socket.id);

	var channel = 'channel-a';

	socket.broadcast.emit('message','user '+socket.id+' connected!','System');

	socket.join(channel);

	socket.on('message',function(msj){
		//io.emit('message',msj,socket.id);
		io.sockets.in(channel).emit('message',msj,socket.id); //enviar a todos del canal
		//socket.broadcast.to(channel).emit('message',msj,socket.id); //enviar a todos del canal menos a mi
	});

	socket.on('disconnect',function(){
		console.log("Disconnect : %s",socket.id);
	});

	socket.on('change channel',function(newChannel){
		socket.leave(channel);
		socket.join(newChannel);
		channel = newChannel;
		socket.emit('change channel',newChannel);
	});

});

http.listen(PORT,function(){
	console.log('Server listen at port %s',PORT);
});