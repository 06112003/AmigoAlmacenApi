const Database = require('../database/db')
const db = Database.db(process.env.DB)

const Controladores = {


    new: (req, res)=>{
        var Estado = parseInt(req.params.id)

        if(Estado == 0){ 

            var NewRopa = {
                producto: req.body.producto,
                proveedor: req.body.proveedor,
                stock: parseInt(req.body.stock),
                imagen: req.body.imagen,
                talla: req.body.talla,
                destinado: req.body.destinado,
            } 

            db.collection('Lista_Productos').find().sort({idProducto: -1}).toArray((err, data)=>{

                if(data && !err){

                    var NewId = 1
                    if(data[0]){                     
                        NewId = parseInt(data[0].idProducto) + 1
                    }                  
                    NewRopa.idProducto = NewId
                    NewRopa.categoria = 'Ropa'
                    NewRopa.fecha = new Date()
                   
                    db.collection('Lista_Productos').insertOne(NewRopa, (err, data)=>{
                        if(data && !err){
                            res.status(200).json({Estado: true, Mensaje: 'Su ropa se registro con exito'})
                        }else{
                            res.status(404).json({Estado: false, Mensaje: 'Su ropa no se pudo registrar'})
                        }
                    })
                }else{               
                    res.status(404).json({
                        Estado: false, 
                        Mensaje: 'Ocurrio un error y el servidor no registro tu ropa'
                    })
                }
            })
        }else{        
            var UpdateRopa = req.body   

            db.collection('Lista_Productos').updateOne({idProducto: Estado}, {$set: UpdateRopa}, (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Su ropa se edito con exito'})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'Su ropa no pudo editarse'})
                }
            })         
        }
    },


    show: (req, res)=>{     
        var IdShow = parseInt(req.params.id)
        db.collection('Lista_Productos').findOne({idProducto: IdShow, categoria: 'Ropa'}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'Se encontraron los datos de la ropa', dato: data})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se encontraron los datos de la ropa', dato: null})
            }
        })
    },


    delete: (req, res)=>{
        var idDelete = parseInt(req.params.id) 
        db.collection('Lista_Productos').deleteOne({idProducto: idDelete}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'Su ropa se elimino con exito'})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se pudo eliminar su ropa'})
            }
        })
    }

    
}

module.exports = Controladores