/**
 * Employee Page routes
 * @author Jake Bass
 */

const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

var inprogressOrders = [];

router.use(getInprogressOrders)
/**
 * Middleware which populates inProgressOrders array with all orders that have not been completed from the database
 * @param {Object} req request object
 * @param {Object} res response object
 * @param {function} next function to execute next middleware
 */
async function getInprogressOrders(req, res, next){
    inprogressOrders = await execQuery("SELECT * FROM customer_orders_inprogress ORDER BY id DESC;");
    next();
}


router.post('/auth', (req, res) => { 
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=4b5f36f104cbfefb755d`
    );


});

router.get('/', getInprogressOrders, (req, res) => { 
    res.render("employee", {inprogressOrders: inprogressOrders});
});

router.post('/', getInprogressOrders, (req, res) => { 
    res.render("employee", {inprogressOrders: inprogressOrders});
});


router.post("/clear/:id", async (req, res) =>{
    await execQuery("DELETE FROM customer_orders_inprogress WHERE id='"+req.params.id+"';");
    inprogressOrders = await execQuery("SELECT * FROM customer_orders_inprogress ORDER BY id DESC;");
    res.render("employee", {inprogressOrders: inprogressOrders});
});

router.post("/clearall", async (req, res) =>{
    await execQuery("DELETE FROM customer_orders_inprogress");
    inprogressOrders = await execQuery("SELECT * FROM customer_orders_inprogress ORDER BY id DESC;");
    res.render("employee", {inprogressOrders: inprogressOrders});
});


module.exports = router;