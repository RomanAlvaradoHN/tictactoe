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
let myturn = true;




document.getElementById('input_text').addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
        e.preventDefault();
        document.getElementById('btn_enviar').click();
    }
})
document.getElementById('btn_enviar').addEventListener('click', (e)=>{
    if (document.getElementById('input_text').value.trim() !== ''){
    	GS.enviar({
        	'operacion': 'chat.message',
        	'player': document.getElementById("char_choice").value,
        	'message': document.getElementById('input_text').value
    	});

	 	document.getElementById('input_text').value = "";
    }
})




function newGameBoard(){
    for (let index = 1; index <= 9; index++) {
        square = document.createElement('div');
        square.setAttribute('id', 'square_' + index);
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
        if(square.getAttribute('item-filled') == "false"){
            let player = document.getElementById("char_choice").value;
            let square_id = square.getAttribute('id');

            square.children[0].innerHTML = player;
            square.setAttribute('item-filled', true);
            doTurn();
            moveCount ++;
            
            GS.enviar({
                'operacion': 'player.update',
                'player': player,
                'square_id': square_id,
                'contador': moveCount
            });

            validarGanador();
        }
    }
}


function player_update(resp){
    if(resp['player'] != document.getElementById("char_choice").value){
        
        square = document.getElementById(resp['square_id']);
        square.children[0].innerHTML = resp['player'];
        square.setAttribute('item-filled', true);
        
        moveCount = resp['contador'];
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



function validarGanador(){
    let player = document.getElementById("char_choice").value;
    let ganador = false;

    //Posibles combinaciones para ganar
    combinaciones = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
        [1, 5, 9],
        [3, 5, 7]
    ]
    
    combinaciones.forEach((combinacion)=>{
        let [a, b, c] = combinacion;
        
        a = document.getElementById('square_' + [a]).children[0].innerHTML;
        b = document.getElementById('square_' + [b]).children[0].innerHTML;
        c = document.getElementById('square_' + [c]).children[0].innerHTML;

        if((a + b + c) == (player + player + player)){
            ganador = true;     
        }
    });


    if(ganador){
        GS.enviar({
            'operacion': 'anunciar.ganador',
            'message': player + ' es el ganador!!!'
        });
    
    }else if((moveCount == 9) && (!ganador)){
        GS.enviar({
            'operacion': 'anunciar.empate'
        });
    }
}





function reset(){
    moveCount = 0;
    
    marca = document.getElementById("char_choice").value;
    if(marca == 'X'){
        myturn = true
        document.getElementById("alert_move").style.display = 'inline';
    }else{
        myturn = false
        document.getElementById("alert_move").style.display = 'none';
    }
    
    document.querySelectorAll('.square').forEach((item)=>{
        item.children[0].innerHTML = "";
        item.setAttribute('item-filled', false);
    });
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


        case "anunciar.ganador":
            if(confirm(resp['message'] + ".\nJugar otra partida?") == true){
                reset();
            }
            break;

        case "anunciar.empate":
            if(confirm("Es un empate.\nJugar otra partida?") == true){
                reset();
            }
            break;


        case 'chat.message':
            chat_message(resp);
            break;

        default:
            console.log("sin operacion")
    }
}