const morgan = require("morgan")
const app = require("./app")
const mongoose = require('mongoose')
const Puerto = process.env.PORT || 3000


//----------------------------------------Configurando servidor----------------------------------------//
app.use(morgan('dev'))
app.use((req, res, next)=>{
    res.status(404).send('La Api no encontro la ruta que ingrezo')
})
//----------------------------------------Configurando Database----------------------------------------//
mongoose.Promise = global.Promise
mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.2sxcm.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`, {useNewUrlParser: true}).then(()=>{
    console.log('La conexion a la db es correcta')
    //Cracion del servidor
    app.listen(Puerto, ()=>{
        console.log(`El servidor inicio en el puerto ${Puerto}`)
    })
}).catch(err=> console.log(err))