const express = require('express')
const dotenv = require("dotenv")
const cors = require("cors")
const app = express()

//Ejecucion de Midelwares
app.use(express.urlencoded({extended: true}))
app.use(express.json({limit: '70mb'}))
dotenv.config()

//Configuradndo cors
var corsOption = {
    origin: "*", 
    optionsSuccessStatus: 200
}
app.use(cors(corsOption))


//Lista de rutas
const FormRopa = require('./router/Rt_FormRopa')
const FormBebidas = require('./router/Rt_FormBebidas')
const FormComida = require('./router/Rt_FormComida')
const FormResportes = require('./router/Rt_FormReportes')
const ViewData = require('./router/Rt_ViewData')
const Usuarios = require('./router/Rt_Usuarios')

//Direccionando rutas
app.use('/FormRopa', FormRopa)
app.use('/FormBebidas', FormBebidas)
app.use('/FormComida', FormComida)
app.use('/FormReportes', FormResportes)
app.use('/viewData', ViewData)
app.use('/Usuarios', Usuarios)

module.exports = app