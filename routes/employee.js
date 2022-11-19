const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

router.get('/', (req, res) => { 
    res.render("employee");

});


router.post("/", async (req, res) =>{
    
    res.render("employee");
});





module.exports = router;