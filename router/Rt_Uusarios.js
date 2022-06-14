const express = require("express")
const router = express.Router()
const ctr_Usuarios = require("../controllers/ctr_Usuarios")

router.post('/NewUsuario', ctr_Usuarios.new)
router.post('/LogUser', ctr_Usuarios.login)
router.put('/EditUsuario/:id', ctr_Usuarios.edit)
router.get('/ViewUsuario', ctr_Usuarios.view)


module.exports = router