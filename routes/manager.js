const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

var info = [];
var recentRestock = [];

router.use(getRecentRestock);
async function getRecentRestock(req, res, next){
    recentRestock = await execQuery("SELECT * FROM restock_orders ORDER BY time_of_order DESC LIMIT 25;");
    next();
}

//Intial Manager Page
router.get('/', (req, res) => { 
    res.render("manager",  {recentRestock: recentRestock, btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
});
router.post('/1', (req, res) => { 
    res.render("manager",  {recentRestock: recentRestock, btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
});

router.post('/', async (req, res) => { 
    info = await execQuery("SELECT name, restock_price, restock_amount, order_unit, inventory from item WHERE name ='"+req.body["item-name"]+"';");
    
    if (info.length !== 0){
        info[0]["disp"] = "block";
        info[0]["btndisp"] = "none";
        itemRestock = info[0]["restock_price"];
        info[0]["recentRestock"] = recentRestock;

        
        res.render("manager", info[0]);
    }else{
        res.render("manager",  {recentRestock: recentRestock, btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL', errmsg: "Please Select a valid Item"});
    }
});


router.post('/0', async (req, res) => { 
    if (req.body["restock-amt"] !== ""){
        //update inventory
        await execQuery("UPDATE item SET inventory=inventory+" + req.body["restock-amt"] + " where name='" + info[0].name + "'");
        
        //get info for restock order
        let newid = parseInt((await execQuery("SELECT MAX(id) FROM restock_orders"))[0].max) + 1;
        let myDate = new Date();
        let timenow = myDate.getFullYear() + '-' +('0' + (myDate.getMonth()+1)).slice(-2)+ '-' +  ('0' + myDate.getDate()).slice(-2) + ' '+myDate.getHours()+ ':'+('0' + (myDate.getMinutes())).slice(-2)+ ':'+myDate.getSeconds();
        let employee_id = 1;

        //create restock order
        await execQuery("INSERT INTO restock_orders(id, time_of_order, item_name, amount, price, employee_id, order_unit) VALUES ("+newid+", '" + timenow + "', '" + info[0].name + "', " + req.body["restock-amt"]*info[0]["restock_amount"] + ", "+ info[0]["restock_price"]*req.body["restock-amt"] + ", " + employee_id + ", '" +info[0]["order_unit"]+"');");

        recentRestock = await execQuery("SELECT * FROM restock_orders ORDER BY time_of_order DESC LIMIT 25;");

        //Render Page with updated info
        res.render("manager", {recentRestock:recentRestock, btndisp: "block", disp: "none", sucmsg: "Restock Order Complete!", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
    }else{
        res.render("manager", {recentRestock:recentRestock, btndisp: "block", disp: "none", errmsg: "Error: Could not complete restock order", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
    }
    
});


module.exports = router;