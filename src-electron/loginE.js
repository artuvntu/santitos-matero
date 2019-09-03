const electron = require('electron');

function inicializar() {
    errorHandlerLGI = (err) => {
        console.error(err);
    }
   
}

module.exports = {
    inicializar: inicializar
}