const {MongoClient} = require("mongodb")
const client = new MongoClient(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.2sxcm.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`)

client.connect().then((Response)=>{
    console.log(`Se conecto la base de datos en la direccion ${Response.s.url}`)
}).catch(err =>{
    console.log(`Ocurrio un error: ${err}`)
})

module.exports = client