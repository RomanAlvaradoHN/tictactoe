window.onload = (event)=>{
    nuevaGrilla();
    GS = new GameSocket();
}






function nuevaGrilla(){
    grilla = document.querySelector('#grilla');
    
    for (let i = 3; i <= 27; i+=3) {
        cuadro = document.createElement('div');
        cuadro.className = "cuadro border border-primary rounded-end";
        cuadro.innerText = i;
        grilla.appendChild(cuadro);
    }   
}









class GameSocket{
    constructor(){
        this.sala = JSON.parse(document.getElementById('sala_info').textContent);
        
        this.socket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/tictactoe/'
            + this.sala
            + '/'
        );

        this.socket.onopen = (e)=>{console.log('Conexion establecida')}
        this.socket.onclose = (e)=>{console.error('Conexion terminada')}
        this.socket.onmessage = (e)=>{message_manager(JSON.parse(e.data))};

    }

    enviar(data){
        this.socket.send(JSON.stringify({
            'data': data
        }))
    }
}





function message_manager(data){
    console.dir(data);
}