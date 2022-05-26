const express = require("express")
const router = express.Router()
const ctr_FormRopa = require("../controllers/ctr_FormRopa")


router.post('/new/:id', ctr_FormRopa.new)
router.get('/show/:id', ctr_FormRopa.show)
router.delete('/delete/:id', ctr_FormRopa.delete)

module.exports = router



