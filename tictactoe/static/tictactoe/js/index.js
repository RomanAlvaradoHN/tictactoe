window.onload = (e)=>{
    document.querySelector('#nombre_sala').focus();
    document.querySelector('#nombre_sala').onkeyup = function(e) {
        if (e.key === 'Enter') {  // enter, return
            document.querySelector('#btn_iniciar').click();
        }
    };

    document.querySelector('#btn_iniciar').onclick = function(e) {
        var nombreSala = document.querySelector('#nombre_sala').value;
        if (nombreSala.trim() === '') {
            return false
        
        }else{
            window.location.pathname = '/tictactoe/' + nombreSala + '/';
        }
        
    };
}