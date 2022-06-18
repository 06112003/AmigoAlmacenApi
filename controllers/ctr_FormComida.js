const Database = require('../database/db')
const db = Database.db(process.env.DB)

const Controladores = {
    
    
    new: (req, res)=>{
        var Estado = parseInt(req.params.id)  

        if(Estado == 0){   

            var NewComidas = {
                producto: req.body.producto,
                proveedor: req.body.proveedor,
                stock: parseInt(req.body.stock),
                imagen: req.body.imagen,
                vencimiento: req.body.vencimiento,
                composicion: req.body.composicion,
                grupo: req.body.grupo,  
                idUsuario: req.body.idUsuario          
            } 

            db.collection('Lista_Productos').find().sort({idProducto: -1}).toArray((err, data)=>{                
                if(data && !err){

                    var NewId = 1
                    if(data[0]){
                        NewId = parseInt(data[0].idProducto) + 1
                    }

                    NewComidas.idProducto = NewId
                    NewComidas.categoria = 'Comidas'
                    NewComidas.fecha = new Date()
                    
                    db.collection('Lista_Productos').insertOne(NewComidas, (err, data)=>{
                        if(data && !err){
                            res.status(200).json({Estado: true, Mensaje: 'Su comida se registro con exito'})
                        }else{
                            res.status(404).json({Estado: false, Mensaje: 'Su comida no se pudo registrar'})
                        }
                    })
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'Ocurrio un error y el servidor no registro tu comida'})
                }
            })
        }else{
            var UpdateComida = req.body
            db.collection('Lista_Productos').updateOne({idProducto: Estado}, {$set: UpdateComida}, (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Su comida se edito con exito'})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'Su comida no pudo editarse'})
                }
            })
        }
    },

    
    show: (req, res)=>{
        var IdShow = parseInt(req.params.id)
        if (IdShow != 0){
            db.collection('Lista_Productos').findOne({idProducto: IdShow, categoria: 'Comidas'}, (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Se encontraron los datos de la comida', dato: data})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'No se encontraron los datos de la comida', dato: null})
                }
            })
        }else {
            db.collection('Lista_Productos').find({ categoria: 'Comidas'} ).toArray((err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Se encontro la categoria comida', dato: data})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'No se encontro la categoria comida', dato: null})
                }
            })
        }

    },



    delete: (req, res)=>{
        var idDelete = parseInt(req.params.id) 
        db.collection('Lista_Productos').deleteOne({idProducto: idDelete}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'Su comida se elimino con exito'})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se pudo eliminar su comida'})
            }
        })
    },


    Vergraficos : (req, res)=>{
        db.collection('Lista_Productos').aggregate(
            [
                {
                    $match: {categoria : "Comidas"}
                },
                {
                    $group: {
                        _id : "$grupo",
                        count : {$sum:1}
                    }
                },
            ]
        ).toArray((error,data)=>{
            if(data && !error){
                res.status(200).json({Estado: true,dato: data })
            }else{
                res.status(404).json({Estado: false,dato: null })
            }
        })
    }


}

module.exports = Controladores