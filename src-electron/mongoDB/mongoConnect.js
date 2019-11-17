const mongoose = require('mongoose');
const async = require('async');
const DTO = require('./mongoSchemes');

//URL
let urlMongo = 'mongodb://localhost:27017/santitos'
let respuestasIniciarSesion = {
    fail:'FAIL',
    accesoIncorrecto:'DENY',
    good:'OK'
}
/**
 * used for connect mongo database with async 
 * @param {(error)=>{}} callback 
 */
function connectMongo(callback) {
    mongoose.connect(urlMongo,{useNewUrlParser:true},callback)
}
/**
 * send date range and get tickets of this
 * @param {{inicio:Date,fin:Date}} rangoFechas 
 * @param {(response)=>{}} completionHandled 
 * @param {(err)=>{}} errorHandler 
 */
function infoForGraficas(rangoFechas,completionHandledTickets,completionHandledPlatillos,errorHandler) {
    async.waterfall([
        connectMongo,
        (_,callback) => {findCortes(rangoFechas,callback)},
        findTicketByCorte
    ],(err,respuesta) => {
        if (err) errorHandler(err);
        else {
            completionHandledTickets(respuesta.map(t => t.toObject()));
            var arrayPlatillos = {};
            var arrayFamiliasPlatillos = {};
            respuesta.flatMap(ticket => ticket.platillos).forEach(platillo => arrayPlatillos[platillo.platillo_id] = (arrayPlatillos[platillo.platillo_id] || 0) + platillo.count);
            async.waterfall([
                (callback) => {findPlatillosByIds(Object.keys(arrayPlatillos), callback)},
                (platillos,callback) => {
                    platillos.forEach(platillo => arrayFamiliasPlatillos[platillo.family_id] = (arrayFamiliasPlatillos[platillo.family_id] || 0) + arrayPlatillos[platillo._id] );
                    findFamiliasPlatillosByIds(Object.keys(arrayFamiliasPlatillos),callback)
                }
            ],(err,respuesta) => {
                if (err) errorHandler(err);
                else {
                    completionHandledPlatillos(respuesta.map((t) => {return {cantidad: arrayFamiliasPlatillos[t._id], familia: t.toObject()}}))
                };
            })
        }
    })
}

/**
 * used for find cortes with async
 * @param {{inicio: Date, fin: Date}} rangoFechas - Rango de fechas que buscar
 * @param {(err, data) => {}} callback - Acción a realizar en caso de exito
 */
function findCortes(rangoFechas,callback) {
    DTO.Corte.find({close_date:{$gte:rangoFechas.inicio,$lte:rangoFechas.fin}}).exec(callback);
}
/**
 * used for find tickets by corte id
 * @param {[mongoose.Schema.type.ObjectId]} corte 
 * @param {(err, data) => {}} callback 
 */
function findTicketByCorte(cortes,callback) {
    let arr = cortes.map(ele => new mongoose.Types.ObjectId(ele._id))
    DTO.Ticket.find({corte_id:{$in: arr}}).sort({fecha:1}).exec(callback)
}
/**
 * used for find platillos with async
 * @param {[String]} arrayPlatillos - Arreglo de id's que se requiere procesar
 * @param {(err, data) => {}} callback - Acción a realizar en caso de exito
 */
function findPlatillosByIds(arrayPlatillos,callback) {
    let arr = arrayPlatillos.map(ele => new mongoose.Types.ObjectId(ele))
    DTO.Platillo.find({_id:{$in: arr}}).exec(callback)
}
/**
 * used for fin familias of platillos by id
 * @param {[String]} arrayFamPla - Arreglo de id's que se solicita buscar
 * @param {(err, data) => {}} callback - Acción a realiar en caso de exito
 */
function findFamiliasPlatillosByIds(arrayFamPla,callback) {
    let arr = arrayFamPla.map(ele => new mongoose.Types.ObjectId(ele))
    DTO.FamiliaPlatillo.find({_id:{$in: arr}}).exec(callback)
}
/**
 * get de currtent corte
 * @param {(response)=>{}} completionHandled - Respuesta de la consulta
 * @param {(err) => {}} errorHandler - En caso de error
 */
function findActualCorte(completionHandled, errorHandler) {
    async.waterfall([
        connectMongo,
        corteNotClosed
    ],(err, respuesta) => {
        if (err) errorHandler(err);
        else {
            if (respuesta.length < 1) {
                completionHandled({status:'nuevo'})
            } else if (respuesta.length == 1) {
                let corteIniciado = respuesta[0]
                var r = {status:'single',corte:corteIniciado.toObject()} 
                completionHandled(r)
            } else {
                completionHandled({status:'multiples',cortes:respuesta.map(c => c.toObject())})
            }
        }
    })
}
/**
 * Funtion for find cortes with flag is_close in false
 * @param {Any} _ - any of arguments
 * @param {(Any) => {}} callback on success action
 */
function corteNotClosed(_,callback) {
    DTO.Corte.find({is_close: false}).exec(callback)
    
}
function iniciarSesion(user, respuesta) {
    mongoose.connect(urlMongo,{useNewUrlParser: true},(err)=>{
        if (err) respuesta({status:respuestasIniciarSesion.fail,err:err});
        DTO.User.findOne(user).exec((err,usuario) => {
            if (err) respuesta({status:respuestasIniciarSesion.fail,err:err}) 
            else if (usuario){
                respuesta({status:respuestasIniciarSesion.good,usuario:usuario.toObject()})
            } else {
                respuesta({status:respuestasIniciarSesion.accesoIncorrecto})
            }
        })
    })
}
function buscarUsuario(user, respuesta) {

    mongoose.connect(urlMongo,{ useNewUrlParser: true}, (err) => {
        if (err) throw err;
        console.log('Conectado');
        
        var arturo = new DTO.User ({
            name:"orutberto",
            user_id: "artuvntu3",
            pass: "1234567",
            permisos: 0
        });
        arturo.save(function(err){
            if (err) {
                if (err.name == "ValidatorError") {

                } else {
                    throw err;
                }
            } else {
                console.log('Guardado');
            }
        })
    })
}
module.exports = {
    respuestasIniciarSesion: respuestasIniciarSesion,
    iniciarSesion: iniciarSesion,
    infoForGraficas: infoForGraficas,
    findActualCorte: findActualCorte
}