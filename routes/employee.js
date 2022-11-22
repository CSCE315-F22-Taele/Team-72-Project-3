const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

var inprogressOrders = [];

router.use(getInprogressOrders)
async function getInprogressOrders(req, res, next){
    inprogressOrders = await execQuery("SELECT * FROM customer_orders_inprogress ORDER BY id DESC;");
    next();
}

router.get('/', getInprogressOrders, (req, res) => { 
    res.render("employee", {inprogressOrders: inprogressOrders});
});

/*router.post('/init', async (req, res) => { 
    await execQuery("DELETE FROM customer_orders_inprogress");
    res.render("employee");
});*/

router.post('/', getInprogressOrders, (req, res) => { 
    res.render("employee", {inprogressOrders: inprogressOrders});
});

/*router.post("/clear", async (req, res) =>{
    await execQuery("DELETE FROM customer_orders_inprogress WHERE id='" +  +"'");
    res.render("employee", {inprogressOrders: inprogressOrders});
});*/

router.post("/clearall", async (req, res) =>{
    await execQuery("DELETE FROM customer_orders_inprogress");
    res.render("employee", {inprogressOrders: inprogressOrders});
});

module.exports = router;