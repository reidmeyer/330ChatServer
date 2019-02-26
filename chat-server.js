var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");
var name = "Guest";
var chat;
var name1;
var owner;
var blacklist;
var kicklist;
var curUsers;
var password;

var totalUsers = "";


class Room {
    constructor(name,owner,password){
        this.name = name;
        this.owner = owner;
        this.blacklist = [""];
				this.kicklist = [""];
        this.curUsers = [owner];
        this.password = password;
    }
}


var arrRooms = [];
var users = {};
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.

	fs.readFile("client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.

		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.
    socket.on('chatroom_to_server', function(data){
      //  chat = data["chatroom"];
        if(data["passsword"] != ""){
            var checker = false;
				var i;
        for(i = 0; i<arrRooms.length; i++){
            if(arrRooms[i].name == data["chatroom"]){
                checker = true;
                //ROOM ALREADY EXISTS
                socket.emit("create_fail", {errMess:"Room already exits! Cant create that!"})

            }
        }
        if(checker == false){
            var something = new Room(data["chatroom"],data["name"],data["password"]);
                        //console.log("GOT HERE FOR SOME REASONSSSSSSSS");
						socket.join([data["chatroom"], data["name"]]);
            socket.emit("join_success_to_client", {joinchatroom:data["chatroom"],errMess:""})
            arrRooms.push(something);
        }
        }else{


        var checker = false;
				var i;
        for(i = 0; i<arrRooms.length; i++){
            if(arrRooms[i].name == data["chatroom"]){
                checker = true;
                //ROOM ALREADY EXISTS
                socket.emit("create_fail", {errMess:"Room already exits! Cant create that!"})

            }
        }
        if(checker == false){
            var something = new Room(data["chatroom"],data["name"],data["password"]);
                        //console.log("GOT HERE FOR SOME REASONSSSSSSSS");
						socket.join([data["chatroom"], data["name"]]);

            socket.emit("join_success_to_client", {joinchatroom:data["chatroom"],errMess:""})
            arrRooms.push(something);
        }
        }
    })
	socket.on('joinroom_to_server', function(data){
        //console.log("name: "+data["name"]);
        //name = "<" + data["name"] + ">: ";
        var checker = false;
				var i;
        for(i = 0; i<arrRooms.length; i++){
            if(arrRooms[i].name == data["chatroomjoin"]){
                checker = true;
								//check if you are blacklisted
								var blacklisted = false;
								for (var q = 0; q < arrRooms[i].blacklist.length;q++)
								{
									if (data["name"]==arrRooms[i].blacklist[q])
									{
										console.log("you've been blacklisted from this chatroom");
										blacklisted = true;
									}
								}



                if(arrRooms[i].password == data["password"] && !blacklisted){


                arrRooms[i].curUsers.push(data["name"]);
                                socket.emit("leave_room", {errMess:"A user has Left the room!"});
								socket.leave(data["chatroom"]);

        for(var l = 0; l< arrRooms.length; l++){
            if(arrRooms[l].name == data["chatroom"]){


                for(var j = 0; j<arrRooms[l].curUsers.length; j++){
                    if(arrRooms[l].curUsers[j] == data["name"]){
                        //console.log("THINGY: " + arrRooms[l].curUsers[j]);
												arrRooms[l].curUsers.splice(j,1);
                        //console.log("THINGY: " + arrRooms[l].curUsers[j]);
                    }
                }

            }
        }
                                //console.log("GOT HERE FOR SOME REASONZZZZZZZZ");
								socket.join([data["chatroomjoin"], data["name"]]);

								//console.log("i joined" + data["chatroomjoin"]);

								socket.emit("join_success_to_client", {joinchatroom:data["chatroomjoin"],errMess:""})
            }
                else{
                   socket.emit("join_success_to_client", {joinchatroom:"",errMess:"Wrong password."})
                }
            }
        }
        if(checker == false){
					var something = new Room(data["chatroomjoin"],data["name"],data["password"]);
					//console.log("leaving" + data["chatroom"]);
                    socket.emit("leave_room", {errMess:"A user has Left the room!"});
					socket.leave(data["chatroom"]);


                    for(var l = 0; l< arrRooms.length; l++){
                        if(arrRooms[l].name == data["chatroom"]){

                            for(var j = 0; j<arrRooms[l].curUsers.length; j++){
                                if(arrRooms[l].curUsers[j] == data["name"]){
                                    //console.log("THINGY: " + arrRooms[l].curUsers[j]);
                                    arrRooms[l].curUsers.splice(j,1);
                                    //console.log("THINGY: " + arrRooms[l].curUsers[j]);
                                }
                            }
                        }
                    }

					//console.log("joining" + data["chatroomjoin"]);
                    //console.log("GOT HERE FOR SOME REASONKKKKKKKK");
					socket.join([data["chatroomjoin"], data["name"]]);

					arrRooms.push(something);
                    socket.emit("join_success_to_client", {joinchatroom:data["chatroomjoin"],errMess:"Room didnt exist, created one you are the owner!"})


            //THAT ROOM DOESNT EXIST DO CODE FOR THIS
        }
    });
	socket.on('message_to_server', function(data) {
        totalUsers = "";
				var ownercheck = "false";
        for(var i = 0; i< arrRooms.length; i++){
            if(arrRooms[i].name == data["chatroom"]){
                //console.log(arrRooms[i].name);
								if(arrRooms[i].owner == data["name"]){
                    ownercheck = "true";
                }
                for(var j = 0; j<arrRooms[i].curUsers.length; j++){
                    totalUsers = totalUsers +"-" + arrRooms[i].curUsers[j] + "<br>";
                }
            }
        }
				totalUsers=totalUsers+"\r\n Chatrooms Available: ";

				for(var i = 0; i< arrRooms.length; i++){
					totalUsers = totalUsers+ arrRooms[i].name + ", ";
}
        //console.log(totalUsers);

		// This callback runs when the server receives a new message from the client.
		//console.log("message: "+data["message"]); // log it to the Node.JS output
		//io.sockets.emit("message_to_client",{message:name + data["message"] })
        //name = "<" + data["name"] + ">: ";
        //console.log("CHATROOM: " + data["chatroom"]);
				//maybe have if statement here

				io.to(data["chatroom"]).emit("message_to_client",{message:data["message"],totalUsers:totalUsers, ownercheck:ownercheck })// broadcast the message to other users
	});


	socket.on('priv_message_to_server', function(data) {
		console.log("recipient is " + data["messageto"]);
		console.log("message is " + data["message"]);
			//socket.broadcast.to(data["messageto"]).emit('message', 'blah');
				io.to(data["messageto"]).emit("message_to_client",{message:data["message"],totalUsers:totalUsers })// broadcast the message to other users

	});


	socket.on('ban_to_server', function(data) {
				//if ()
				//name/chatroom/baninput

				for (var i = 0; i<arrRooms.length; i++)
				{
					if (arrRooms[i].name == data["chatroom"] && arrRooms[i].owner == data["name"])
					{
						console.log("added to blacklist");
						var thebaninput = data["baninput"];

						arrRooms[i].blacklist.push(thebaninput);
						console.log("added to blacklist: " + data["baninput"]);
					}
				}
	});

	socket.on('kick_to_server', function(data) {
		for (var i = 0; i<arrRooms.length; i++)
		{
			if (arrRooms[i].name == data["chatroom"] && arrRooms[i].owner == data["name"])
			{
				console.log("added to kicklist!");
				var thekickinput = data["kickinput"];

				arrRooms[i].kicklist.push(thekickinput);
				console.log("added to kicklist: " + data["kickinput"]);
			}
		}
	});


//checks if you're banned
socket.on('timer', function(data) {
	//console.log("banned server interval");

	for (var i = 0; i< arrRooms.length; i++)
	{
		if (arrRooms[i].name == data["chatroom"])
		{
			for (var k = 0; k < arrRooms[i].blacklist.length; k++)
			{
				//console.log("checking for blacklist");

				if (arrRooms[i].blacklist[k] == data["name"])
				{
					console.log("kicking a blacklisted user");
                    socket.emit("leave_room", {errMess:"A user has been kicked from the room!"});
					socket.leave(data["chatroom"]);
					socket.emit("left", {})

					for(var l = 0; l< arrRooms.length; l++){
							if(arrRooms[l].name == data["chatroom"]){
									for(var j = 0; j<arrRooms[l].curUsers.length; j++){
											if(arrRooms[l].curUsers[j] == data["name"]){
													arrRooms[l].curUsers.splice(j,1);
											}
									}
							}
					}
				}
			}
		}
	}



	//console.log("kick server interval");

	for (var i = 0; i< arrRooms.length; i++)
	{
		if (arrRooms[i].name == data["chatroom"])
		{
			for (var k = 0; k < arrRooms[i].kicklist.length; k++)
			{
				//console.log("checking for kicklist:");
				//console.log(arrRooms[i].kicklist[k]);
				if (arrRooms[i].kicklist[k] == data["name"])
				{
					console.log("kicking a kicklisted user");
                    socket.emit("leave_room", {errMess:"A user has Left the room!"});
					socket.leave(data["chatroom"]);
					socket.emit("left", {})

					arrRooms[i].kicklist.splice(k,1);
					for(var l = 0; l< arrRooms.length; l++){
							if(arrRooms[l].name == data["chatroom"]){
									for(var j = 0; j<arrRooms[l].curUsers.length; j++){
											if(arrRooms[l].curUsers[j] == data["name"]){
													arrRooms[l].curUsers.splice(j,1);
											}
									}
							}
					}
				}
			}
		}
	}
});

});
