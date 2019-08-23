const mongoose = require('mongoose');
const mongooseUnique = require('mongoose-unique-validator');

//Esquema
/**
 * User echema
 */
var userSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    old_id: Number,
    name:String,
    user_id:{
        type: String,
        unique: true
    },
    pass:{
        type: String,
        select: false
    },
    permisos:Number
})
userSchema.plugin(mongooseUnique);
/**
 * Corte schema
 */
let corteSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    old_id:Number,
    folio:Number,
    autorizacion_encargado:Boolean,
    impuesto:Number,
    create_date:Date,
    close_date:Date,
    dinero_cajon:Number,
    next_id_ticket:Number,
    is_close:Boolean,
    who: {
        personal_id:mongoose.Schema.Types.ObjectId,
        personal_old_id:Number,
        personal_name:String,
    },
    cuentas: mongoose.Schema.Types.Mixed
})
/**
 * Ticket Schema
 */
var ticketSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    old_id:Number,
    corte_id:mongoose.Schema.Types.ObjectId,
    corte_old_id:Number,
    folio:Number,
    price:Number,
    price_witout_discounts:Number,
    change:Number,
    is_cancelled:Boolean,
    is_to_take_away:Boolean,
    auth_name:String,
    discount_type:String,
    discount_amount:Number,
    state:String,
    fecha:Date,
    state:String,
    payment:Object,
    platillos:[Object]
})
/**
 * Platilo Schema
 */
var platilloSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    old_id: Number,
    family_id: mongoose.Schema.Types.ObjectId,
    family_old_id: Number,
    name: String,
    name_ticket: String,
    name_control: String,
    icon_name: String,
    price: Number,
    is_available: Boolean,
    is_print_kitchen: Boolean,
    description: String
})
var familiaPlatilloSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: new mongoose.Types.ObjectId()
    },
    old_id: Number,
    name: String,
    icon_name: String
})
//Models
module.exports = {
    User:  mongoose.model('personal',userSchema,"personal"),
    Corte: mongoose.model('cortes',corteSchema,"cortes"),
    Ticket: mongoose.model('tickets',ticketSchema,"tickets"),
    Platillo: mongoose.model('platillos',platilloSchema,"platillos"),
    FamiliaPlatillo: mongoose.model('familias_platillos',familiaPlatilloSchema, 'familias_platillos')
}

