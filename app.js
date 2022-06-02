const express = require('express')
const dotenv = require("dotenv")
const app = express()

//Ejecucion de Midelwares
app.use(express.urlencoded({extended: true}))
app.use(express.json({limit: '70mb'}))
dotenv.config()

//Configuracion de CORS 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With,Content-Type, Accept, Access-Control-Allow-Request-Method');
    req.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Lista de rutas
const FormRopa = require('./router/Rt_FormRopa')
const FormBebidas = require('./router/Rt_FormBebidas')
const FormComida = require('./router/Rt_FormComida')
const FormResportes = require('./router/Rt_FormReportes')
const ViewData = require('./router/Rt_ViewData')
const Usuarios = require('./router/Rt_Uusarios')

//Direccionando rutas
app.use('/FormRopa', FormRopa)
app.use('/FormBebidas', FormBebidas)
app.use('/FormComida', FormComida)
app.use('/FormReportes', FormResportes)
app.use('/viewData', ViewData)
app.use('/Usuarios', Usuarios)

module.exports = app