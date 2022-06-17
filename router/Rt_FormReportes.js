const express = require("express")
const router = express.Router()
const ctr_FormReporte = require("../controllers/ctr_FormReportes")

router.post('/New/:id', ctr_FormReporte.new)
router.get('/show/:id', ctr_FormReporte.show)
router.delete('/Delete/:id', ctr_FormReporte.delete)
router.get('/vergraficoreportes', ctr_FormReporte.mostrarGrafico)


module.exports = router                 