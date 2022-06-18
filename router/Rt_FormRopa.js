const express = require("express")
const router = express.Router()
const ctr_FormRopa = require("../controllers/ctr_FormRopa")


router.post('/new/:id', ctr_FormRopa.new)
router.get('/show/:id', ctr_FormRopa.show)
router.delete('/delete/:id', ctr_FormRopa.delete)
router.get('/show_graf', ctr_FormRopa.show_graf)

module.exports = router

,,,,,;;;;;;

