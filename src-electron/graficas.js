const electron = require('electron');
const mongoConnect = require('./mongoDB/mongoConnect');
const { dialog } = electron;

addDays = function(f,days) {
    var date = new Date(f.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

/**
 * Funcion para inicializar los procesos de escucha de la seccion de graficas
 */
function inicializar() {
    errorHandler = (err) => {
        console.error(err)
    }
    electron.ipcMain.on('gpx-setDate',(event,arg) => {
        if (arg.inicio == null || arg.fin == null) {
            dialog.showMessageBox(event.sender.getOwnerBrowserWindow(),{
                title: "Algo salio mal",
                message: "Alguna fecha no fue seleccionada"
            })
        } else {          
            mongoConnect.infoForGraficas(arg,(tickets) => {
                if (tickets) event.reply('gpx-setDate-response',processInfoTickets(arg,tickets));
                else {
                    dialog.showMessageBox(event.sender.getOwnerBrowserWindow(),{
                        title: "Vuelve a intentarlo",
                        message: "Los rangos de fechas seleccionados no contienen tickets disponibles"
                    })
                }
            }, (platillos) => {
                let r = platillos.map(ele => {return {type:ele.familia.name, value: ele.cantidad}})
                event.reply('gpx-setDate-response-P',{puntos:r});
            }, errorHandler)
        }
    })
}
/**
 * procesa los tickes y devuelve una respuesta con la informacion necesaria
 * @param {Electron.IpcMainEvent} event 
 * @param {{fin:Date,inicio:Date}} fechas
 * @param {ticketObjetc} tickets 
 */
function processInfoTickets(fechas,tickets) {
    var respuesta =  {
        total: {
          ticketsCount: 0,
          costoTotal: 0
        },
        diario: {
          ticketsCount: 0,
          costoTotal: 0
        },
        semanal: {
          ticketsCount: 0,
          costoTotal: 0
        },
        mensual: {
          ticketsCount: 0,
          costoTotal: 0
        }
      };
    var topeFecha = addDays(fechas.inicio,1)
    var promedioDiario = []
    var pActual = {
        ticketCount: 0,
        costoTotal: 0,
        promedio: 0,
        fecha: topeFecha
    }
    var objetoFormasPagos = {}
    for (let ticket of tickets) {
        // informacion total
        respuesta.total.costoTotal += ticket.price
        respuesta.total.ticketsCount++;
        if (ticket.fecha < topeFecha) {
            pActual.ticketCount++;
            pActual.costoTotal += ticket.price;
        } else {
            if (pActual.ticketCount > 0) {
                pActual.promedio = pActual.costoTotal / pActual.ticketCount;
                promedioDiario.push(pActual)
            }
            topeFecha = addDays(topeFecha,1);
            pActual = {
                ticketCount: 1,
                costoTotal: ticket.price,
                promedio: 0,
                fecha: topeFecha
            }
        }
        if (ticket.payment) {
            
            Object.keys(ticket.payment).forEach(fp => {objetoFormasPagos[fp] = (objetoFormasPagos[fp] || 0) + ticket.payment[fp]});
        }
        
        
    }

    if (pActual.ticketCount > 0) {
        pActual.promedio = pActual.costoTotal / pActual.ticketCount;
        promedioDiario.push(pActual)
    }
    
    if (promedioDiario.length > 0) {
        // Diario
        respuesta.diario.ticketsCount = Math.trunc( respuesta.total.ticketsCount / promedioDiario.length);
        respuesta.diario.costoTotal = respuesta.total.costoTotal / promedioDiario.length;
        // Semanal
        respuesta.semanal.ticketsCount = 7 * respuesta.diario.ticketsCount;
        respuesta.semanal.costoTotal = 7 * respuesta.diario.costoTotal;
        // Mensual
        respuesta.mensual.ticketsCount = 30 * respuesta.diario.ticketsCount;
        respuesta.mensual.costoTotal = 30 * respuesta.diario.costoTotal;
    }
    respuesta.puntos = promedioDiario;
    respuesta.puntosFormasPagos = Object.keys(objetoFormasPagos).map(ele => {return {type: ele, value: objetoFormasPagos[ele]}})
    respuesta.puntosFormasPagos
    return respuesta;
}
module.exports = {
    inicializar:inicializar
}

