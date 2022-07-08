const express = require("express")
const router = express.Router()
const ctr_Usuarios = require("../controllers/ctr_Usuarios")


router.post('/NewUsuario/:cnd', ctr_Usuarios.new)
router.post('/LogUser', ctr_Usuarios.login)

router.get('/ViewUsuario/:id', ctr_Usuarios.view)
router.get('/SearchUsuario', ctr_Usuarios.searchUsuario)
router.get('/VldEstado/:id', ctr_Usuarios.validarEstado)

router.get('/DeleteUser/:id', ctr_Usuarios.delete)
router.get('/Graficar', ctr_Usuarios.grafico)



module.exports = router