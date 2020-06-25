/*
Connect 4
Individual Term Project
Brandon Lu
30053269

File: server.js
Desc: A simple implementation of connect 4 using nodejs, express and socket.io

*/


var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var cookieparser = require("cookie-parser");
app.use(cookieparser());
app.use(express.static("public"));


http.listen(3000, function () {
    console.log("listening on *:3000");
});


// use res.render to load up an ejs view file

// index page, grab the room num etc from this page
app.get('/', function (req, res) {
    res.render('index');
});

gamerooms = {};

/*
array.remove(array, element) functionality
Source: https://stackoverflow.com/questions/5767325/how-to-remove-specific-item-from-array
*/
function removeelem(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
    }
};

/*
Modified version of array.remove to find specific elements
*/
function findelem(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        return 1;
    } else {
        return 0;
    }
};

io.on("connection", function (socket) {

    function closeroom() {
        //player disconnect
        if (socket.room in gamerooms)
        {
            delete gamerooms[socket.room];
            io.to(socket.room).emit('close room');
            //console.log(socket.room + " has been closed");
        }
        else
        {
            //console.log("Room " + socket.room + " doesn't exist anymore");
        }
    };

    function switchturn(gamestate) {
        if (gamestate.turn === 1)
        {
            gamestate.turn = 2;
        }
        else
        {
            gamestate.turn = 1;
        }
        //console.log("It is now " + gamestate.turn + " turn");
    };

    function checkdiagonal(piecea, pieceb, piecec, pieced, pid) {

        /*
        let s = "";
        s += piecea;
        s += pieceb;
        s += piecec;
        s += pieced;
        s += pid;
        /*

        /*
        Okay so, originally this was all a single in-line if statement, however it simply evaluates to false, even with all the same values and same types.
        After debugging for a couple hours, this "solution" evaluates the input correctly.
        Very janky, wouldn't recommend this be used at all for anything except a last resort fix

        Might be an intermittent issue, may actually work and my system is buggy, however this disgusting code works for the time being
        and I dont have much free time to debug the root cause
        */

        let count = 0;
        if (piecea === pid)
        {
            count++;
        }
        if (pieceb === pid)
        {
            count++;
        }
        if (piecec === pid)
        {
            count++;
        }
        if (pieced === pid)
        {
            count++;
        }

        if (count >= 4)
        {
            return true;
        }

        // Original piece of code that doesnt evaluate properly
        /*
       if ((piecea === pieceb) && (piecea === piecec) && (piecea=== pieced) && (piecea=== pid))
       {
           console.log("evaluated true");
           return true;
       }
       */

    };

    function winCondition(board, pid) {
        win = false;

        // horizontal
        for (let row = 0; row < 6; row++)
        {
            let count = 0;

            for(let col = 0; col < 7; col++)
            {
                if (board[row][col] === pid)
                {
                    count++;
                    if (count >= 4)
                    {
                        //console.log("win by horizontal");
                        return true;
                    }
                }
                else
                {
                    count = 0;
                }


            }
        }

        // vertical win
        for (let col = 0; col < 7; col++)
        {
            let count = 0;

            for (let row = 0; row < 6; row++)
            {
                if (board[row][col] === pid)
                {
                    count++;
                    if (count >= 4)
                    {
                        //console.log("Win by vertical");
                        return true;
                    }
                }
                else
                {
                    count = 0;
                }


            }
        }

        // diagonal left-right

        for (let row = 0; row <= 6 - 4; row++)
        {

            for (let col = 0; col <= 7 - 4; col++)
            {
                let piecea = board[row][col];
                let pieceb = board[row+1][col+1];
                let piecec = board[row+2][col+2];
                let pieced = board[row+3][col+3];

                if (checkdiagonal(piecea, pieceb, piecec, pieced, pid))
                {
                    //console.log("reached diagonal left-right");
                    return true;
                }

            }
        }


        // diagonal right-left

        for (let row = 0; row <= 6 - 4; row++)
        {
            for (let col = 6; col >= 7 - 4; col--)
            {
                let piecea = board[row][col];
                let pieceb = board[row+1][col-1];
                let piecec = board[row+2][col-2];
                let pieced = board[row+3][col-3];

                if (checkdiagonal(piecea, pieceb, piecec, pieced, pid))
                {
                    //console.log("reached diagonal right-left");
                    return true;
                }

            }
        }

        //console.log("evaluated false");
        return false;
    };

    console.log("User connected to the socketio");


    //res.cookie('name', socket.username).send('cookie set'); //Sets name = express

    socket.on('create room', function (data) {
        // room stored as obj in gamerooms
        if (data.room in gamerooms)
        {
            let gamestate = gamerooms[data.room];
            if (typeof gamestate.p2 != 'undefined') {
                return;
            }
            console.log("Player 2 has joined the lobby " + data.room);
            socket.join(data.room);
            socket.room = data.room;
            socket.playerid = 2;
            socket.name = data.name;
            

            gamestate.p2 = socket;
            socket.opponent = gamestate.p1;
            gamestate.p1.opponent = socket;

            socket.emit("player join", {playerid: socket.playerid, roomnumber: socket.room});
            gamestate.turn = 1;

            //console.log(gamestate.p1.name);
            //console.log(gamestate.p2.name);
            //console.log(gamestate.turn);

            console.log("Ready signal sent to lobby " + socket.room);
            io.sockets.in(data.room).emit("lobby ready", {p1: gamestate.p1.name, p2: gamestate.p2.name, turn: gamestate.turn});


        }
        else
        {
            //console.log("data name in else is " + data.name);
            // room already exists in the pool, join the room
            //console.log(data.room);
            //console.log(socket.adapter.rooms);
            if (data.room in socket.adapter.rooms <= 0)
            {
                socket.join(data.room);
            }
            // room doesnt already exist in socketio, create a new room
            socket.room = data.room;
            socket.playerid = 1;
            socket.name = data.name;

            gamerooms[data.room] = {
                p1: socket,
                moves: 0,
                turnNumber: 0,
                // "The most commonly used Connect Four board size is 7 columns × 6 rows."
                board: [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0]
                    ]
            };
            console.log("Player 1 created the lobby " + data.room);
            socket.emit('player join', {playerid: socket.playerid, uid: socket.uid, roomnumber: socket.room});
        }
    });


    socket.on('make turn', function (data) {
        //console.log("Move made");
        let gamestate = gamerooms[data.room];

        // offset 6 to 5
        turnsuccess = false;

        for (let i = 5; i >= 0; i--)
        {
            if (gamestate.board[i][data.xcord] === 0) 
            {
                gamestate.board[i][data.xcord] = data.pid;
                //console.log("Tossing piece into " + i + " y and " + data.xcord + " x");
                turnsuccess = true;
                break;
            }

            if (i === 0)
            {
                //console.log("the slot is full");
            }
            
        }

        /* Print the board
        for (let row = 0; row < 6; row++)
        {
            let s = "";
            for (let col = 0; col < 7; col++)
            {
                s += gamestate.board[row][col] + " ";
            }
            console.log(s);
        }
        */

        if (turnsuccess)
        {
            // switch turn
            //console.log("Turn success");
            gamestate.turnNumber++;
            if (winCondition(gamestate.board, data.pid))
            {
                io.to(socket.room).emit("move made", {turn: gamestate.turn, board: gamestate.board});
                console.log("player " + data.pid + " has won in room " + socket.room);
                io.to(socket.room).emit("game won", {pid: data.pid});
            }
            else if (gamestate.turnNumber >= 42)
            {
                io.to(socket.room).emit("game draw");
                console.log(socket.room + " has played until a draw");

            }
            else
            {
                switchturn(gamestate);
                io.to(socket.room).emit("move made", {turn: gamestate.turn, board: gamestate.board});
            }

        }
        else
        {
            // error the user, dont switch turn, get new input
            //console.log("Move not made, restarting turn");
            socket.emit("move failed");
        }


    });

    socket.on("get rooms available", function(data) {
        //if (data.room in socket.adapter.rooms <= 0)
        let randomroom;
        //console.log(socket.adapter.rooms);
        //console.log(typeof socket.adapter.rooms);
        //console.log("player lobby is : " + data.playerlobby);


        const roomkeys = Object.values(socket.adapter.rooms);
        var regex = /^[0-9]+$/;

        for (const [key, value] of Object.entries(socket.adapter.rooms))
        {
            if (value.length === 1 && key.match(regex) && key !== data.playerlobby && !(socket.id in value.sockets))
            {
                randomroom = key;
                //console.log(key + " is sent as an available room");
            }
        }
        //console.log(randomroom);
        if (typeof randomroom === "undefined")
        {
            //console.log("No rooms available.");
            socket.emit("no rooms available");
        } else {
            socket.emit("sent rooms available", {room: randomroom, name: data.name});
        }
    });

    socket.on("new username", function(data) {
        let gamestate = gamerooms[socket.room];
        //console.log("Request to update username logged");
        

        if (data.playerid === 1)
        {
            gamestate.p1.name = data.name;
        }
        else if
        (data.playerid === 2)
        {
            gamestate.p2.name = data.name;
        }
        else
        {
            console.log("Unexpected behaviour");
        }

        //console.log("Sending request to update display names");

        if (typeof gamestate.p2 != 'undefined')
        {
            io.to(socket.room).emit('update names', {p1: gamestate.p1.name, p2: gamestate.p2.name});
        }
        else
        {
            io.to(socket.room).emit('update names', {p1: gamestate.p1.name});
        }
    });

    socket.on("leave lobby", function() {
        socket.leave(playerlobby);
    });

    socket.on("disconnect", function () {
        closeroom();
    });

    socket.on("reconnect event", username => {
        console.log("Reconnect on socket name " + socket.name);
    });

});