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
                                //ENCRIPTAMOS LA CONTRASEÑA
                                var saltos = await bcrypt.genSalt(10);
                                var password = await bcrypt.hash(NewUser.password, saltos);
                                NewUser.password = password                         
                                //               
                                var NewId = 1
                                if(data[0]){        
                                    var NewId = parseInt(data[0].idUsuario) + 1
                                }
                                NewUser.idUsuario = NewId 
                                NewUser.fecha = new Date()
                                //
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
                
            }
        })        
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

    validarEstado: (req, res)=>{
        var idUsuario = req.params.id
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
        db.collection('Usuarios').find().toArray((err, datos)=>{
            if(datos && !err){                
                res.status(200).json({Estado: true, data: datos})
            }else{
                res.status(404).json({Estado: false, data: null})
            }
        })
    }

    
}

module.exports = Controladores