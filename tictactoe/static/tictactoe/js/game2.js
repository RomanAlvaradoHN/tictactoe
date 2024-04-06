class GameSocket{
    constructor(){
        this.sala_id = document.getElementById("room_code").value;
        
        this.socket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/tictactoe/'
            + this.sala_id  //<---- sala_id
            + '/'
        );

        this.socket.onopen = (e)=>{
            console.log('Conexion establecida');
            this.enviar({'operacion': 'establecer.marca'})
            //this.enviar({'operacion': 'oper.start'})
        }

        this.socket.onclose = (e)=>{console.error('Conexion terminada')}
        this.socket.onmessage = (e)=>{response_handler(JSON.parse(e.data))};

    }

    enviar(data){this.socket.send(JSON.stringify(data))}
}


let GS = new GameSocket();
newGameBoard();
let moveCount = 0;
let accumulator = 0;
let myturn = true;





document.getElementById('btn_enviar').addEventListener('click', (e)=>{
    GS.enviar({
        'operacion': 'chat.message',
        'player': document.getElementById("char_choice").value,
        'message': document.getElementById('input_text').value
    });
})




function newGameBoard(){
    for (let index = 3; index <= 27; index += 3) {
        square = document.createElement('div');
        square.setAttribute('item-id', index);
        square.setAttribute('item-filled', false);
        square.classList.add('square', 'border', 'border-primary')

        marca = document.createElement('p')
        marca.classList.add('marca')
        square.appendChild(marca);

        square.addEventListener('click', (e)=>{
            player_move(e.target);
        });

        document.getElementById('game_board').appendChild(square);
    }
}



function player_move(square){
    if(!myturn){
        alert("Espera por el otro jugador")
    
    }else{
        let player = document.getElementById("char_choice").value;
        let square_id = square.getAttribute('item-id');

        square.children[0].innerHTML = player
        square.setAttribute('item-filled', true);
        doTurn();
        moveCount ++;
        accumulator += square_id;
        winnerValidation();
        
        GS.enviar({
            'operacion': 'player.update',
            'player': player,
            'square_id': square_id
        });
    }
}


function player_update(resp){
    if(resp['player'] != document.getElementById("char_choice").value){
        
        document.querySelectorAll('.square').forEach((item)=>{
            
            if(item.getAttribute('item-id') == resp['square_id']){
                item.children[0].innerHTML = resp['player'];
                item.setAttribute('item-filled', true);
            }

        });
        doTurn();
    }
}


function doTurn(){
    if(myturn){
        myturn = false;
        document.getElementById("alert_move").style.display = 'none';
    
    }else{
        myturn = true;
        document.getElementById("alert_move").style.display = 'inline';
    }
}



function winnerValidation(){
    if(moveCount == 3){
        if((accumulator % 9) == 0){
            //ganador
        }
    }else if(moveCount > 3){
        if((accumulator % 3) == 0){
            //ganador
        }
    }
}




function make_move(index, player){
    index = parseInt(index);
    let data = {
        "operacion": "oper.move",
        "message": {
            "index": index,
            "player": player
        }
    }
    
    if(gameBoard[index] == -1){
        moveCount++;
        if(player == 'X')
            gameBoard[index] = 1;
        else if(player == 'O')
            gameBoard[index] = 0;
        else{
            alert("Invalid character choice");
            return false;
        }
        GS.enviar(data);
    }

    const win = checkWinner();
    if(myturn){
        if(win){
            data = {
                "operacion": "oper.end",
                "message": `${player} es el ganador. Jugar de nuevo?`
            }
            GS.enviar(data)
        }
        else if(!win && moveCount == 9){
            data = {
                "operacion": "oper.end",
                "message": "Es un empate. Jugar de nuevo?"
            }
            GS.enviar(data)
        }
    }
}


function checkWinner(){
    let win = false;
    if (moveCount >= 5) {
      winIndices.forEach((w) => {
        if (check(w)) {
          win = true;
          windex = w;
        }
      });
    }
    return win;
}

const check = (winIndex) => {
    if (
      gameBoard[winIndex[0]] !== -1 &&
      gameBoard[winIndex[0]] === gameBoard[winIndex[1]] &&
      gameBoard[winIndex[0]] === gameBoard[winIndex[2]]
    )   return true;
    return false;
};


function reset(){
    gameBoard = [
        -1, -1, -1,
        -1, -1, -1,
        -1, -1, -1,
    ]; 
    
    moveCount = 0;
    
    marca = document.getElementById("char_choice").value;
    if(marca == 'X'){
        myturn = true
        document.getElementById("alert_move").style.display = 'inline';
    }else{
        myturn = false
        document.getElementById("alert_move").style.display = 'none';
    }
    
    cuadros = document.querySelectorAll('.square > p');
    cuadros.forEach((item)=>{
        item.innerHTML = "";
    })
}


function updateGameBoard(index, player){
    if(player == 'X'){
        gameBoard[index] = 1;
    
    }else if(player == 'O'){
        gameBoard[index] = 0;
    }

    cuadros = document.querySelectorAll('.square')
    cuadros.forEach((item)=>{
        if(item.getAttribute('data-index') == index){
            item.children[0].innerHTML = player;
        }
    })

    doTurn();
}





function chat_message(resp){
    chat_log = document.getElementById('chat-log');

    bubble = document.createElement('div');
    if(resp['player'] != document.getElementById("char_choice").value){
        bubble.classList.add('text-start')
    }else{
        bubble.classList.add('text-end')
    }

    content = document.createElement('div');
    content.classList.add('d-inline-flex', 'chat-bubble', 'p-3', 'my-1', 'text-white', 'bg-primary', 'bg-opacity-10', 'border', 'border-primary', 'rounded-pill');
    content.innerHTML = resp['message'];

    bubble.appendChild(content);

    chat_log.appendChild(bubble);
    chat_log.scrollTop = chat_log.scrollHeight;
}













function response_handler(resp){
    console.clear();
    console.dir(resp);

    switch (resp["operacion"]) {

        case 'establecer.marca':
            document.getElementById("char_choice").value = resp.marca;
            document.getElementById("marca").innerHTML = resp.marca;
            reset()
            break;

        case 'player.update':
            player_update(resp);
            break;


        case "oper.end":
            alert(resp['message']);
            reset();
            break;


        case "oper.move":
            index = resp['message']['index'];
            player = resp['message']['player'];

            if(player != document.getElementById("char_choice").value){
                make_move(index, player)
            }
            
            break;

        case 'chat.message':
            chat_message(resp);
            break;

        default:
            console.log("sin operacion")
    }
}