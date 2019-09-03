const elecrton = require('electron');
const mongoConnect = require('./mongoDB/mongoConnect');
/**
 * Funcion para inicializar los processo de escucha de la seccion de ventas
 */

function inicializar() {
    errorHandlerVTS = (err) => {
        console.error(err)
    }
    elecrton.ipcMain.on('vts-getCorte',(event) => {
        mongoConnect.findActualCorte((value)=>{
            switch (value.status) {
                case 'single':
                if (value.corte.who.personal_id.equals(usuario._id)) {
                    event('vts-getCorte-R',event.corte)
                } else {
                    
                }
                break;

            }
            if (value.status ) {
                
            }
            
        },errorHandlerVTS);
    })
}
module.exports = {
    inicializar: inicializar   
}