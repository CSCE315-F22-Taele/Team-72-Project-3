const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");

const router = express.Router();

router.get('/', (req, res) => { 
    res.render("employee");
});

module.exports = router;