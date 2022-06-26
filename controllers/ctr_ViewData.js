const Database = require('../database/db')
const db = Database.db(process.env.DB)

const Controladores = {


    ViewPrincipal: (req, res)=>{
        //Filtros generales
        var Categoria = req.body.Categoria || ''        
        var Busqueda = req.body.Busqueda || ''
        //Obtener la pagina
        var Pagina = parseInt(req.body.Pagina) || 1
        var minRangoPage = (Pagina - 1) * 6
        //Filtros de orden
        var Stock = parseInt(req.body.Stock) || 0
        var Orden = {}        
        if(Stock != 0){
            Orden.stock = Stock
        }else{
            Orden.idProducto = -1            
        }   
        var GenFilt = {
            $and: [
                {categoria: {$regex: Categoria}}, 
                {producto:  {$regex: Busqueda, "$options" : "i"}}
            ]
        }                                         
        db.collection('Lista_Productos').find(GenFilt).limit(6).skip(minRangoPage).sort(Orden).toArray((err, data)=>{
            if(data || !err){
                //Variable con los productos
                const ArrayData = data 
                //---
                db.collection('Lista_Productos').find(GenFilt).toArray.count((err, data)=>{
                    if(data && !err){
                        console.log(data)
                        //Datos para el paginador
                        const ctnResult = Math.ceil(parseInt(data) / 6)
                        const dataPaginador = {
                            PageMax:  ctnResult,
                            PageAct: Pagina
                        }
                        //---
                        res.status(200).json({Estado: true, Mensaje: 'Se encontraron los productos', dato: ArrayData, pageData: dataPaginador})
                    }else{
                        res.status(404).json({Estado: false, Mensaje: 'No pudieron encontrar el total de registros dentro de la base de datos', dato: null, pageData: null})        
                    }
                })                                
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No tiene ningun producto con esos filtros', dato: null, pageData: null})
            }
        })
    },


    ViewResportes: (req, res)=>{     
        //Filtros generales
        var Estado = req.body.Estado || ''        
        var Busqueda = req.body.Busqueda || ''
        //Filtros de orden
        var Perdidas = parseInt(req.body.Perdidas) || 0
        var Orden = {}
        if(Perdidas !=  0){
            Orden.perdidas = Perdidas
        }else{
            Orden.producto = 1
        }                    
        db.collection('Lista_Reportes').aggregate([                                                                            
            {
                //Establecemos la relacion de la coleccion
                $lookup: {
                    from: 'Lista_Productos',//Coleccion con la que lo vamos a relacionar
                    localField: 'idRef',//En base a que lo vamos a relaconar
                    foreignField: 'idProducto',//Elemento que tiene que estar relacionado con idRef
                    as: 'dataProducto'//Nombre que se le asigna al conjunto de datos relacionados
                }
            },            
            {
                //Se crea un duplicada con los datos fucionados de ambas colleciones
                $unwind: '$dataProducto'
            },
            {
                //Colocamos el find con el que van a aparecer los reportes             
                $match: {$and: [{nvl: {$regex: Estado}}, {'dataProducto.producto':  {$regex: Busqueda, "$options" : "i"}}]},
            },            
            {
                //Los datos que al fina va a estar retornando
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
                //El orden con el que van a salir los productos
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