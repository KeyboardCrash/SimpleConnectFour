/*
Connect 4
Individual Term Project
Brandon Lu
30053269

File: script.js
Desc: A simple implementation of connect 4 using nodejs, express and socket.io

*/



var player = {};
player.lobby = rng(100000, 999999);
player.name = randomUsername();
player.theme = 1;
let pturn = 0;
let turnCount = 0;
let localboard =  [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0]
                    ];


function rng(min, max) {
    let random = Math.floor(Math.random() * (max - min + 1) + min);
    return random;
};

/* 
When the user clicks on the button,
toggle between hiding and showing the dropdown content
https://www.w3schools.com/howto/howto_js_dropdown.asp
*/
function menuFunc() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        /*var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }*/
      }
    }
  } 

function settheme(theme) {
    //console.log("in settheme");
    player.theme = theme;
    createCookie();

    if (Number(theme) === 1)
    {
        document.body.style.background = "beige";
    }
    else if (Number(theme) === 2)
    {
        document.body.style.background = "#AAAAAA";
    }
    else if (Number(theme) === 3)
    {
        document.body.style.background = "RGB(146, 168, 209)";
    }
    
};

// w3schools method to grab cookies by name
// https://www.w3schools.com/js/js_cookies.asp
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    };
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
}

function createCookie() {
    let obj = JSON.parse(
        '{"username":"' + player.name + '","theme":"' + player.theme + '"}'
    );
    document.cookie = "gameCookie=" + JSON.stringify(obj);
}

function readCookie() {
    let cookie = getCookie("gameCookie");
    //console.log('cookie exists', cookie);
    parsed = JSON.parse(cookie);
    //console.log('username ' + parsed.username);
    //console.log('nickcolor ' + parsed.nickcolor);
    player.name = parsed.username;
    player.theme = parsed.theme;
}

// we can delete the cookie by making it be past its expiry
function deleteCookie(name) {
    document.cookie = name + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
}

// Code snippet provided by Pavol Federl
function randomUsername() {
    let parts = [];
    parts.push( ["Small", "Big", "Medium", "Miniscule", "Captivating", "Astonishing", "Fabulous", "Magnificent", "Considerate"] );
    parts.push( ["Red", "Blue", "Bad", "Good", "Round", "Adorable", "Average", "Crowded", "Cute", "Hollow", "Scrawny", "Mammoth", "Great"] );
    parts.push( ["Bear", "Dog", "Potato", "Orangutan", "Klingon", "Bat", "Person", "Animal", "Tart", "Sandwich"] );

    username = "";
    for( part of parts) {
        username += part[Math.floor(Math.random()*part.length)];
    }
    return username;
}

$(document).ready(function() {


    if (!getCookie("gameCookie"))
    {
        createCookie();
    }
    else
    {
        readCookie();
        //console.log("Setting theme");
        //console.log("player name is " + player.name);
        //console.log("player.theme is " + player.theme);
        settheme(player.theme);
    }

    function updateLobby() {
        document.getElementById("playerlobby").textContent = player.lobby;
    };

    function updateName() {
        document.getElementById("username").textContent = ("Your username is: " + player.name);
        $('#username').append("<p>You are Player " + player.playerid + "</p>");
    };

    function updateTurn(turn, player) {
        //console.log("Player " + turn + " turn");
        if (turn === player)
        {
            // Set overlay to your turn
            document.getElementById("turn").innerHTML = "<span>Your Turn</span>";
        }
        else
        {
            // set overlay to enemy turn
            document.getElementById("turn").innerHTML = "<span>Enemy Turn</span>";
    
        }
    };

    function updateDisplayNames(data) {
        if (player.playerid === 1)
        {
            document.getElementById("opponentusername").textContent=("Your opponent is: " + data.p2);
        }
        else
        {
            document.getElementById("opponentusername").textContent=("Your opponent is: " + data.p1);
        }
    };

    function checkTurn() {
        return (pturn === player.playerid);
    };

    function printBoard() {
        for (let row = 0; row < 6; row++)
        {
            for (let col = 0; col < 7; col++)
            {
                // if value at cell is 1, print red
                if (localboard[row][col] === 1)
                {
                    let tmp = ".gameboard tr:eq(" + row + ") td:eq(" + col + ")";
                    $(tmp).html("<img src='./img/redpiece.png'</img>");
                }
                else if (localboard[row][col] === 2)
                {
                    // else it is 2, print yellow

                    let tmp = ".gameboard tr:eq(" + row + ") td:eq(" + col + ")";
                    $(tmp).html("<img src='./img/yellowpiece.png'</img>");
                }
            }
        }
    
    };

    updateLobby();

    // Initial commands done on initial client-server connect
    socket.on("connect", function () {
        console.log("Connected to Server");

        console.log("name is " + player.name);
        socket.emit('create room', {
            room: player.lobby,
            name: player.name
        });
        //console.log(player.lobby);
        //console.log(player.name);
    });

    socket.on('player join', function(data) {
        player.playerid = data.playerid;
        player.lobby = data.roomnumber;

        updateName();

        //updateLobby(playerlobby);
        //console.log("playerid set to " + player.playerid);
    });

    socket.on('lobby ready', function(data) {
        console.log("ready received");
        //console.log(data.opponent);
        //console.log(data);

        updateDisplayNames(data);

        if (player.playerid === 1)
        {
            $(".footer").css("background-color", "red");
        }
        else
        {
            $(".footer").css("background-color", "yellow");

        }

        $(".menucontainer").css('display', 'none');
        $(".gamecontainer").css('display', 'block');
        $(".footer").css('display', 'block');

        //console.log("data.turn is " + data.turn);
        //console.log("player.playerid is " + player.playerid);

        pturn = data.turn;
        updateTurn(data.turn, player.playerid);


    });

    // Logs when a user has disconnected from the server
    socket.on("disconnect", function () {
        console.log("Disconnected from Server. Attempting to reconnect...");

    });

    // Will re-fetch the chat log on reconnecting to the server
    socket.on("reconnect", function () {
        console.log("Reconnected to Server");
        
    });

    socket.on("sent rooms available", function(data){
        socket.emit("leave room", player.lobby);
        socket.emit('create room', {
            room: data.room,
            name: data.name
        });
        player.lobby = data.room;
        updateLobby();
    });

    socket.on("move made", function(data) {
        pturn = data.turn;
        localboard = data.board;
        updateTurn(pturn, player.playerid);
        printBoard();
    });

    socket.on("move failed", function(data) {
        document.getElementById("turn").innerHTML = "<span>Your Turn</span><br><span>Bad move. Enter a new move</span>";
    });

    socket.on("game won", function(data) {
        console.log("Winner detected");
        if (data.pid === 1)
        {
            document.getElementById("turn").innerHTML = "<span>Player 1 is the winner </spin>";
            $('td').off('click');
        }
        else
        {
            document.getElementById("turn").innerHTML = "<span>Player 2 is the winner!</span>";
            $('td').off('click');
        }
    });

    socket.on("game draw", function(data){
        document.getElementById("turn").innerHTML = "<span>Game is a draw!</span>";
        $('td').off('click');
    });

    socket.on("update names", function(data){
        //console.log("updating display names");
        updateDisplayNames(data);
    });

    socket.on("no rooms available", function(data) {
        document.getElementById("error").textContent = "No rooms are currently available";
    });

    // Event listener for form submit - parses message and such
    $("form").submit(function (e) {
        e.preventDefault(); // prevents page reloading

        let existlobby = document.getElementById("lobbynum").value;
        // input validation https://stackoverflow.com/questions/18042133/check-if-input-is-number-or-letter-javascript
        var regex=/^[a-zA-Z]+$/;
        if (existlobby.length === 6 && !existlobby.match(regex) && existlobby !== player.lobby)
        {
            console.log("Lobby gotten is " + existlobby);
            socket.emit('create room', {
                room: existlobby,
                name: player.name
            });
            player.lobby = existlobby
            updateLobby();
            //$(".menucontainer").hide();
        }
        else
        {
            document.getElementById("error").textContent = "Bad lobby number. Please enter a valid lobby";
        }


    });

    $("#newusername").click(function() {
        let a = document.getElementById("newuser").value;

        if (a == '')
        {
            console.log("Blank name not accepted");
        }
        else
        {
            player.name = a;
            socket.emit('new username', {name: player.name, playerid: player.playerid});
            updateName();
            createCookie();
            updateLobby();
        }

    });


    // https://stackoverflow.com/questions/1775466/how-to-get-cells-td-x-and-y-coordinate-in-table-using-jquery
    $("td").click(function() {
        //alert('My position in table is: '+ this.cellIndex+' x ' + this.parentNode.rowIndex + ' y ');
        // Use x value for getting the col to drop a thing into

        xcord = this.cellIndex;
        ycord = this.parentNode.rowIndex;

        if (checkTurn())
        {
            socket.emit("make turn", {xcord: xcord, room: player.lobby, pid: player.playerid});
            //console.log("move sent");
        }

    });

    $("#randomlobby").click(function() {
        socket.emit("get rooms available", {playerlobby: player.lobby, name: player.name});

    });
   

});
