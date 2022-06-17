const Database = require('../database/db')
const db = Database.db(process.env.DB)

const Controladores = {

    
    new: (req, res)=>{
        var Estado = parseInt(req.params.id) 

        if(Estado == 0){
            var NewBebida = {
                producto: req.body.producto,
                proveedor: req.body.proveedor,
                stock: parseInt(req.body.stock),
                imagen: req.body.imagen,
                litros: parseInt(req.body.litros),
                tipo: req.body.tipo,
                idUsuario: req.body.idUsuario        
            } 
            db.collection('Lista_Productos').find().sort({idProducto: -1}).toArray((err, data)=>{                
                if(data && !err){
                    
                    var NewId = 1                    
                    if(data[0]){
                        NewId = parseInt(data[0].idProducto) + 1
                    }

                    NewBebida.idProducto = NewId
                    NewBebida.categoria = 'Bebidas'
                    NewBebida.fecha = new Date()
 
                    db.collection('Lista_Productos').insertOne(NewBebida, (err, data)=>{
                        if(data && !err){
                            res.status(200).json({Estado: true, Mensaje: 'Su bebida se registro con exito'})
                        }else{
                            res.status(404).json({Estado: false, Mensaje: 'Su bebida no se pudo registrar'})
                        }
                    })
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'Ocurrio un error y el servidor no registro tu bebida'})
                }
            })
        }else{
            var UpdateBebidas = req.body

            db.collection('Lista_Productos').updateOne({idProducto: Estado}, {$set: UpdateBebidas}, (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Su bebida se edito con exito'})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'Su bebida no pudo editarse'})
                }
            })
            //
        }
    },



    show: (req, res)=>{
        var IdShow = parseInt(req.params.id)
        if(IdShow = 0){
            db.collection('Lista_Productos').findOne({idProducto: IdShow, categoria: 'Bebidas'}, (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Se encontraron los datos de la bebida', dato: data})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'No se encontraron los datos de la bebida', dato: null})
                }
            })
        }else{
            db.collection('Lista_Productos').find({categoria: 'Bebidas'}).toArray(
                (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Se encontró categoría bebidas', dato: data})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'No se encontró categoría bebidas', dato: null})
                }
            })
        }
    },





    
    delete: (req, res)=>{
        var idDelete = parseInt(req.params.id) 
        
        db.collection('Lista_Productos').deleteOne({idProducto: idDelete}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'Su bebida se elimino con exito'})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se pudo eliminar su bebida'})
            }
        })
    }
    


}


module.exports = Controladores