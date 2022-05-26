const express = require('express')
const router = express.Router()
const ctr_FormComida = require('../controllers/ctr_FormComida')

router.post('/new/:id', ctr_FormComida.new)
router.get('/show/:id', ctr_FormComida.show)
router.delete('/delete/:id', ctr_FormComida.delete)

module.exports = router