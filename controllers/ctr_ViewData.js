const Database = require('../database/db')
const db = Database.db(process.env.DB)

const Controladores = {


    ViewPrincipal: async(req, res)=>{       
        //Filtro para categoria
        var Categoria = req.body.Categoria || ''
        //Filtro para paginar
        var Pagina = parseInt(req.body.Pagina) || 1
        var minRangoPage = (Pagina - 1) * 10
        var dataPaginador = {
            PageMax:  0,
            PageAct: Pagina
        }
        //Filtros de orden
        var Stock = parseInt(req.body.Stock) || 0
        var Orden = {}        
        if(Stock != 0){
            Orden.stock = Stock
        }else{
            Orden.idProducto = -1            
        } 
        //Generando la consulta
        try{                                                                 
            var consultDB =  await db.collection('Lista_Productos').find({categoria: {$regex: Categoria}}).sort(Orden)            
            var ctnResult = await consultDB.count()
            var dataEnv =   await consultDB.skip(minRangoPage).limit(10).toArray()                                              
            dataPaginador.PageMax = Math.ceil(ctnResult / 10) 
            //Ordenar el array por fecha
            dataEnv.sort((a, b)=> a.fecha > b.fecha)
            //---
            res.status(200).json({Estado: true, Mensaje: 'Se encontraron los datos del producto con exito', dato: dataEnv, dataPaginador})
        }catch(err){
            res.status(404).json({Estado: false, Mensaje: 'Ocurrio un error al generar su consulta', dato: [], dataPaginador})
        }
    },


    
    searchProductos: (req, res)=>{
        db.collection('Lista_Productos').find().toArray((err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, dato: data})
            }else{  
                res.status(404).json({Estado: false, dato: []})
            }
        })
    },



    ViewResportes: (req, res)=>{     
        //Filtros generales
        var Estado = req.body.Estado || ''        
        var Busqueda = req.body.Busqueda || ''
        //Filtros de orden
        var Perdidas = parseInt(req.body.Perdidas) || 0
        //Estbleacer el orden
        var Orden = {}
        if(Perdidas !=  0) Orden.perdidas = Perdidas
        else Orden.producto = 1
        //Generar la consulta         
        db.collection('Lista_Reportes').aggregate([                                                                            
            {
                $lookup: {
                    from: 'Lista_Productos',
                    localField: 'idRef',
                    foreignField: 'idProducto',
                    as: 'dataProducto'
                }
            },            
            {
                $unwind: '$dataProducto'
            },
            {
                $match: {$and: [{nvl: {$regex: Estado}}, {'dataProducto.producto':  {$regex: Busqueda, "$options" : "i"}}]},
            },            
            {
                $project: {
                    idReporte: "$idReporte",
                    producto: "$dataProducto.producto",                            
                    proveedor: "$dataProducto.proveedor",                            
                    imagen: "$imagen",                            
                    nvl: "$nvl",                      
                    perdidas: "$perdidas"                                 
                },
            },            
            {
                $sort: Orden
            }                                                                    
            ]).toArray((err, data)=>{
                if(data && !err){                 
                    res.status(200).json({Estado: true, Mensaje: 'Se encontraron los reportes con exito', dato: data})
                }else{
                    res.status(404).json({Estado: false, Mensaje: 'El servidor no puede mostrar tu reporte', dato: null})
                }
            })                            
    }


}

module.exports = Controladores