const express = require('express')
const router = express.Router()
const ctr_ViewData = require('../controllers/ctr_ViewData')

router.post('/ViewPrincipal', ctr_ViewData.ViewPrincipal)
router.post('/ViewReportes', ctr_ViewData.ViewResportes)

module.exports = router