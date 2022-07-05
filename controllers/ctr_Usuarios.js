const Database = require('../database/db')
const db = Database.db(process.env.DB)
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name: process.env.CLOUDNAME, 
    api_key: process.env.APIKEY, 
    api_secret: process.env.APISECRET,
    secure: true     
})

const Controladores = {


    new: async(req, res)=> {           
        var Estado = parseInt(req.params.cnd)        
        
        /*-----------------------REGISTRANDO NUEVO USUARIO-----------------------*/
        if(Estado == 0){
            cloudinary.uploader.upload(req.body.foto, {
                folder: 'Perfil_User'
            }, (err, data)=>{
                if(data && !err){
                    var NewUser = {
                        foto: data.secure_url,
                        id_foto: data.public_id,
                        nombres: req.body.nombres,
                        apellidos: req.body.apellidos,
                        telefono: req.body.telefono,
                        correo: req.body.correo,
                        password: req.body.password,                    
                        estado: false,
                        rol: 'User'
                    }        
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
                                    //--               
                                    var NewId = 1
                                    if(data[0]){        
                                        var NewId = parseInt(data[0].idUsuario) + 1
                                    }
                                    NewUser.idUsuario = NewId 
                                    NewUser.fecha = new Date()
                                    //--
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
            /*---------------------ACTUALIZANDO EL PERFIL DEL USUARIO---------------------*/
        }else{
            db.collection('Usuarios').findOne({idUsuario: Estado}).then(async(err, data)=>{
                if(data && !err){
                    var dataUpdate = req.body
                    var comparePassword = bcrypt.compare(dataUpdate.valPassword, data.password)
                    if(comparePassword){
                        delete dataUpdate.valPassword
                        if(dataUpdate.password == ''){
                            delete dataUpdate.valPassword
                        }
                        if(dataUpdate.foto == ''){
                            delete dataUpdate.foto
                        }else{
                            var updateImage =  await cloudinary.uploader.upload(
                                dataUpdate.foto, {public_id: data.id_foto, invalidate: true}
                            )
                            dataUpdate.foto = updateImage.secure_url
                            dataUpdate.id_foto = updateImage.public_id                                                          
                        }
                        db.collection('Usuarios').updateOne({_id: Estado}, {$set: dataUpdate}).then((err, data)=>{
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



    login: (req, res)=>{      
        db.collection('Usuarios').find({$and: [{correo: req.body.correo}, {estado: true}]}).toArray((err, data)=>{
            if(data.length == 1 && !err){
                //Verficiar password
                var PassCompare = bcrypt.compare(req.body.password, data[0].password)
                //Datos para la session
                var DataSession = {
                    "UserID": data[0].idUsuario,
                    "nombres": data[0].nombres,
                    "apellidos": data[0].apellidos,
                    "telefono": data[0].telefono,
                    "correo": data[0].correo,
                    "foto": data[0].foto,
                    "rol": data[0].rol
                }
                if(PassCompare){
                    res.status(200).json({Estado: true, dato: DataSession, Mensaje: 'Su cuenta se logueo con exito'})
                }else{
                    res.status(404).json({Estado: false, dato: null, Mensaje: 'Su contraseña no coincide'})
                }
            }else{
                res.status(404).json({Estado: false, dato: null, Mensaje: 'Su cuenta no esta habilitada'})
            }
        })
    },

    
    
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



    view: (req, res)=>{
        var param = req.params.id 
        var idUser = parseInt(param.split('&')[0])    
        
        if(idUser == 0){                        
            var busqUser = param.split('&')[1] || ''     
            db.collection('Usuarios').find({$or: [{nombres: {$regex: busqUser, '$options': 'i'}}, {apellidos: {$regex: busqUser, '$options': 'i'}}]}).toArray((err, datos)=>{
                if(datos && !err){                
                    res.status(200).json({Estado: true, data: datos})
                }else{
                    res.status(404).json({Estado: false, data: null})
                }
            })
        }else{
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
                        productos: { $arrayElemAt: [ "$rstProductos.TotalProduct", 0 ]},                         
                        reportes: { $arrayElemAt: [ "$rstReportes.TotalReport", 0 ]},
                    }
                }                
            ]).toArray((err, dato)=>{   
                if(dato && !err){             
                    var dataUser = dato[0]
                    if(!dataUser.productos) dataUser.productos = 0 
                    if(!dataUser.reportes) dataUser.reportes = 0 

                    res.status(200).json({data: dataUser})
                }else{
                    res.status(404).json({data: {}})
                }
            })
        }
    },



    grafico: (req, res)=>{
        console.log("Entrando a gregicos")
        db.collection('Usuarios').aggregate([            
            {
                $group: {
                    _id: '$rol',                    
                    count: {$sum: 1},
                }   
            },
        ]).toArray((err, data)=>{
            if(data && !err){
                res.status(200).json({Estado: true, dato: data})
            }else{
                res.status(404).json({Estado: false, dato: null})
            }
        })
    },


    
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