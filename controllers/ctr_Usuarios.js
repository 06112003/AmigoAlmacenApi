const Database = require('../database/db')
const db = Database.db(process.env.DB)
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary").v2


//---------------------------PRECADAR DATOS DE LA DB---------------------------//

cloudinary.config({
    cloud_name: process.env.CLOUDNAME, 
    api_key: process.env.APIKEY, 
    api_secret: process.env.APISECRET,
    secure: true     
})
function obtDataArray(array){
    var arrayFinal = array.map(e=>({
        idUsuario: e.idUsuario,
        foto: e.foto,
        nombres: e.nombres,
        apellidos: e.apellidos,
        estado: e.estado
    }))
    return arrayFinal;
}




const Controladores = {    


    //---------------------------AGREGANDO NUEVOS USUARIOS---------------------------//    
    
    new: async(req, res)=> {                   
        var Estado = parseInt(req.params.cnd)                
        //Registrando nuevo usuario 
        if(Estado == 0){
            cloudinary.uploader.upload(req.body.foto, {
                folder: 'Perfil_User'
            }, (err, data)=>{
                if(data && !err){                    
                    //Datos del nuevo usario
                    var NewUser = req.body
                    NewUser.foto = data.secure_url
                    NewUser.id_foto = data.public_id
                    NewUser.estado = false
                    NewUser.rol = 'User'
                    //Comrobar si el correo esta repetido
                    db.collection('Usuarios').findOne({correo: NewUser.correo}, (err, data)=>{
                        if(err || data){
                            res.status(404).json({Estado: false, Mensaje: 'Su correo ya esta registrado'})
                        }else{
                            db.collection('Usuarios').find().sort({_id: -1}).toArray(async(err, data)=>{
                                if(data && !err){
                                    //Enciptamos la contraseña
                                    var saltos = await bcrypt.genSalt(10);
                                    var password = await bcrypt.hash(NewUser.password, saltos);
                                    NewUser.password = password                                                                            
                                    var NewId = 1
                                    if(data[0]){        
                                        var NewId = parseInt(data[0].idUsuario) + 1
                                    }
                                    NewUser.idUsuario = NewId 
                                    NewUser.fecha = new Date()
                                    //Registramos al nuevo usuario
                                    db.collection('Usuarios').insertOne(NewUser, (err, data)=>{
                                        if(data && !err){
                                            res.status(200).json({Estado: true, Mensaje: 'El usuario se registro con exito'})
                                        }else{
                                            res.status(404).json({Estado: false, Mensaje: 'Ocurrio un error el ingrezar el usuario'})
                                        }
                                    })
                                }else{ 
                                    res.status(404).json({Estado: false, Mensaje: 'El servidor tiene un proble y no puede ingrezar su usuario'})                                
                                }
                            })                
                        }
                    })
                }else{ 
                    res.status(404).json({Estado: false, Mensaje: 'El servidor no pudo procesar su imagen'})                
                }
            })         
        }else{
            //Actualizando el usuario
            db.collection('Usuarios').findOne({idUsuario: Estado}, async(err, data)=>{                
                if(data && !err){
                    var dataUpdate = req.body                    
                    var comparePassword = await bcrypt.compare(dataUpdate.vrfPassword, data.password)
                    delete dataUpdate.vrfPassword
                    //Verficando los datos de la contraseña     
                    if(comparePassword){             
                        if(dataUpdate.password == ''){
                            delete dataUpdate.password
                        }else{
                            var saltos = await bcrypt.genSalt(10)
                            var encryptPas = await bcrypt.hash(dataUpdate.password, saltos)
                            dataUpdate.password = encryptPas 
                        }
                        //Verificamos los datos de la foto
                        if(dataUpdate.foto == ''){
                            delete dataUpdate.foto
                        }else{
                            var updateImage =  await cloudinary.uploader.upload( dataUpdate.foto, 
                                {public_id: data.id_foto, invalidate: true}
                            )
                            dataUpdate.foto = updateImage.secure_url
                            dataUpdate.id_foto = updateImage.public_id                                                          
                        }      
                        //Ingrezando los datos actualizados                                          
                        db.collection('Usuarios').updateOne({idUsuario: Estado}, {$set: dataUpdate}, (err, data)=>{
                            if(data && !err){ 
                                res.json({Estado: true})
                            }else{ 
                                res.json({Estado: false})
                            }
                        })
                    }else{ 
                        res.json({Estado: false})
                    }                                        
                }else{ 
                    res.json({Estado: false})
                }                 
            })
        }       
    },



    //---------------------------LOGEANDO A LOS USUARIOS---------------------------//
    
    login: (req, res)=>{      
        db.collection('Usuarios').findOne({$and: [{correo: req.body.correo}, {estado: true}]}, (err, data)=>{
            if(data && !err){
                //Verficiar password
                var PassCompare = bcrypt.compare(req.body.password, data.password)
                //Datos para la session
                var DataSession = {
                    "UserID": data.idUsuario,
                    "nombres": data.nombres,
                    "apellidos": data.apellidos,
                    "telefono": data.telefono,
                    "correo": data.correo,
                    "foto": data.foto,
                    "rol": data.rol
                }
                if(PassCompare){
                    res.status(200).json({Estado: true, dato: DataSession, Mensaje: 'Su cuenta se logueo con exito'})
                }else{
                    res.status(404).json({Estado: false, dato: null, Mensaje: 'Su contraseña no coincide'})
                }
            }else{
                res.status(404).json({Estado: false, dato: null, Mensaje: 'Su cuenta no esta habilitada o los datos no son correctos'})
            }
        })
    },



    //---------------------------EDITAR EL ESTADO DEL USUARIO---------------------------//
    
    edit: async(req, res)=>{
        var IdDelete = parseInt(req.params.id)
        var DataEdit = req.body

        if(DataEdit.Contraseña){
            var saltos = await bcrypt.genSalt(10);
            var password = await bcrypt.hash(DataEdit.Contraseña, saltos);            
            DataEdit.Contraseña = password
        }
        db.collection('Usuarios').updateOne({idUsuario: IdDelete},  {$set: DataEdit}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, Mensaje: 'El usuario se edito con exito'})
            }else{
                res.status(404).json({Estado: false, Mensaje: 'No se pudo editar el usuario'})
            }
        })
    },


    
    //---------------------------VERIFICA EL USUARIO ACTIVO---------------------------//
    
    validarEstado: (req, res)=>{
        var idUsuario = parseInt(req.params.id)
        db.collection('Usuarios').findOne({idUsuario: idUsuario}, (err, data)=>{
            if(data && !err){
                var rstEstado = data.estado                
                res.status(200).json({Estado: true, data: rstEstado})
            }else{
                res.status(404).json({Estado: false, data: false})
            }
        })
    }, 



    //---------------------------OBTIENE EL DATO O LOS DATOS---------------------------//

    view: async(req, res)=>{
        var idUser = parseInt(req.params.id) 
        if(idUser == 0){                     
            //Declarando los filtros                                                                      
            var ordenFilt =  parseInt(req.query.Orden || -1)
            var pageAct = parseInt(req.query.Page || 1)
            var rangoPage = (pageAct - 1) * 5
            var roles = req.query.Rol || ''                                            
            try{
                //Consulta genereal
                var consult = await db.collection('Usuarios').find({rol: {$regex: roles}}).sort({idUsuario: ordenFilt})
                //Ordenando los resultados
                var ctnRegistros = await consult.count()
                var totalPage = Math.ceil(ctnRegistros / 5) 
                var dataArray = await  consult.skip(rangoPage).limit(5).toArray()    
                var dataFinal = obtDataArray(dataArray)            
                //Respuesta positiva
                res.status(200).json({Estado: true, data: dataFinal, maxPage: totalPage})
            }catch(err){
                //Respuesta negativa
                console.log(err)
                res.status(404).json({Estado: false, data: null, maxPage: 0})
            }            
        }else{
            //Datos de usuario especifico 
            db.collection('Usuarios').aggregate([   
                {
                    $match: {idUsuario: idUser}
                },        
                {
                    $lookup: {
                        from: 'Lista_Productos',
                        localField: 'idUsuario',
                        foreignField: 'idUsuario',
                        pipeline: [{$count: "TotalProduct"}],                        
                        as: 'rstProductos' 
                    },
                },                
                {   
                    $lookup: {
                        from: 'Lista_Reportes',
                        localField: 'idUsuario',
                        foreignField: 'idUsuario',                        
                        pipeline: [{$count: "TotalReport"}],
                        as: 'rstReportes' 
                    },
                },
                {
                    $project: {
                        foto: '$foto',
                        correo: '$correo',
                        telefono: '$telefono',
                        nombres: '$nombres',
                        rol: '$rol',
                        productos: { $arrayElemAt: [ "$rstProductos.TotalProduct", 0 ]},                         
                        reportes: { $arrayElemAt: [ "$rstReportes.TotalReport", 0 ]},
                    }
                }                
            ]).toArray((err, dato)=>{   
                if(dato && !err){             
                    var dataUser = dato[0]
                    if(!dataUser.productos) dataUser.productos = 0 
                    if(!dataUser.reportes) dataUser.reportes = 0 
                    //Respuesta positiva
                    res.status(200).json({data: dataUser})
                }else{
                    //Respuesta negativa
                    res.status(404).json({data: {}})
                }
            })
        }
    },



    //---------------------------OBTIENE LOS DATOS PARA EL BUSCADOR---------------------------//
    
    searchUsuario: (req, res)=>{
        db.collection('Usuarios').find().toArray((err, dato)=>{
            if(dato && !err){
                var dataFinal = obtDataArray(dato)         
                res.status(200).json({Estado: true, data: dataFinal})
            }else{  
                res.status(404).json({Estado: false, data: []})
            }
        })
    },



    //---------------------------DATOS PARA EL GRAFICO---------------------------//

    grafico: (req, res)=>{
        db.collection('Usuarios').aggregate([            
            {
                $group: {_id: '$rol', count: {$sum: 1}}   
            },
        ]).toArray((err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, dato: data})
            }else{
                res.status(404).json({Estado: false, dato: null})
            }
        })
    },


    
    //---------------------------ELIMINA AL USUARIO SELECCIONADO---------------------------//
    
    delete: (req, res)=>{
        var idDelete = parseInt(req.params.id)
        db.collection('Usuarios').deleteOne({idUsuario: idDelete}, (err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, data: 'El usuario se elimino con exito' })
            }else{
                res.status(404).json({Estado: false, data: 'El usuario no se elimino con exito'})
            }
        })
    }

    
}

module.exports = Controladores