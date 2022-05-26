const Database = require('../database/db')
const db = Database.db(process.env.DB)

const Controladores = {
    
    
    new: (req, res)=>{
        var Estado = parseInt(req.params.id)

        if(Estado == 0){

            var DataReport = {
                perdidas: parseInt(req.body.perdidas),
                idRef: parseInt(req.body.idRef),
                detalles: req.body.detalles,
                nvl: req.body.nvl,             
                imagen: req.body.imagen
            }     

            db.collection('Lista_Productos').findOne({idProducto: DataReport.idRef}, (err, data)=>{
                if(data && !err){

                    db.collection('Lista_Reportes').find().sort({idReporte: -1}).toArray((err, data)=>{
                        if(data && !err){

                            var NewId = 1
                            if(data[0]){
                                NewId = parseInt(data[0].idReporte) + 1 
                            }
                            DataReport.idReporte = NewId
                            DataReport.fecha = new Date()

                            db.collection('Lista_Reportes').insertOne(DataReport, (err, data)=>{
                                if(data && !err){
                                    res.status(200).json({Estado: true, Mensaje: 'Su reporte se registro con exito'})
                                }else{
                                    res.status(404).json({Estado: false, Mensaje: 'El servidor rechazo el ingrezo de su reporte'})
                                }
                            })
                        }else{
                            res.status(404).json({Estado: false, Mensaje: 'El servidor tuvo problemas al registrar su reporte'})
                        }
                    })
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'El id del producto que intenta reportar no existe'})
                }
            })
        }else{
            const UpdateReportes = req.body
            db.collection('Lista_Reportes').updateOne({idReporte: Estado}, {$set: UpdateReportes}, (err, data)=>{
                if(data && !err){
                    res.status(200).json({Estado: true, Mensaje: 'Su reporte se edito con exito'})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'No se pudo editar su reporte'})
                }
            })
        }
    },


    show: (req, res)=>{
        var IdShow = parseInt(req.params.id)
        db.collection('Lista_Reportes').findOne({idProducto: IdShow}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'Se encontraron los datos del reporte', dato: data})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se encontraron los datos del reporte', dato: null})
            }
        })
    },


    delete: (req, res)=>{
        var IdDelete = parseInt(req.params.id)
        db.collection('Lista_Reportes').deleteOne({idReporte: IdDelete}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'Se elimino con exito su reporte'})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se pudo eliminar su reporte'})
            }
        })
    }


}

module.exports = Controladores