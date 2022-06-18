const express = require('express')
const router = express.Router()
const ctr_FormBebidas = require('../controllers/ctr_FormBebidas')

router.post('/new/:id', ctr_FormBebidas.new)
router.get('/show/:id', ctr_FormBebidas.show)
router.delete('/delete/:id', ctr_FormBebidas.delete)
router.get('/graf_bebidas', ctr_FormBebidas.show_graf)


module.exports = router