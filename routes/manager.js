const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

var info = [];


router.get('/', (req, res) => { 
    res.render("manager",  { btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
});

router.post('/', async (req, res) => { 
    info = await execQuery("SELECT name, restock_price, restock_amount, order_unit, inventory from item WHERE name ='"+req.body["item-name"]+"';");
    
    if (info.length !== 0){
        info[0]["disp"] = "block";
        info[0]["btndisp"] = "none";
        itemRestock = info[0]["restock_price"];

        res.render("manager", info[0]);
    }else{
        res.render("manager",  { btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL', msg: "Please Select a valid Item"});
    }
});


router.post('/COMPLETE', async (req, res) => { 
    if (req.body["restock-amt"] !== ""){
        await execQuery("UPDATE item SET inventory=inventory+" + req.body["restock-amt"] + " where name='" + info[0].name + "'");
        res.render("manager", {btndisp: "block", disp: "none", msg: "Restock Order Complete!", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
    }else{
        res.render("manager", {btndisp: "block", disp: "none", msg: "Error: Could not complete restock order", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
    }
    
});


module.exports = router;