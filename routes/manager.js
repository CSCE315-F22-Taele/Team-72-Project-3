const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

var info = [];
var recentRestock = [];
var restock = [];
var sale = [];
var excess = [];

router.use(getRecentRestock);
async function getRecentRestock(req, res, next){
    recentRestock = await execQuery("SELECT * FROM restock_orders ORDER BY time_of_order DESC LIMIT 25;");
    next();
}

//Intial Manager Page
router.get('/', (req, res) => { 
    res.render("manager",  {excess:excess, sale:sale, restock:restock, recentRestock: recentRestock, btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
});
router.post('/1', (req, res) => { 
    res.render("manager",  {excess:excess, sale:sale, restock:restock, recentRestock: recentRestock, btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
});

router.post('/', async (req, res) => { 
    info = await execQuery("SELECT name, restock_price, restock_amount, order_unit, inventory from item WHERE name ='"+req.body["item-name"]+"';");
    
    if (info.length !== 0){
        info[0]["disp"] = "block";
        info[0]["btndisp"] = "none";
        itemRestock = info[0]["restock_price"];
        info[0]["recentRestock"] = recentRestock;
        info[0]["restock"] = restock;
        info[0]["sale"]= sale;
        info[0]["excess"] = excess;

        
        res.render("manager", info[0]);
    }else{
        res.render("manager",  {excess:excess, sale:sale, restock:restock, recentRestock: recentRestock, btndisp: "block", disp: "none", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL', errmsg: "Please Select a valid Item"});
    }
});


router.post('/0', async (req, res) => { 
    if (req.body["restock-amt"] !== ""){
        //update inventory
        await execQuery("UPDATE item SET inventory=inventory+" + req.body["restock-amt"]*info[0].restock_amount + " where name='" + info[0].name + "'");
        
        //get info for restock order
        let newid = parseInt((await execQuery("SELECT MAX(id) FROM restock_orders"))[0].max) + 1;
        let myDate = new Date();
        let timenow = myDate.getFullYear() + '-' +('0' + (myDate.getMonth()+1)).slice(-2)+ '-' +  ('0' + myDate.getDate()).slice(-2) + ' '+myDate.getHours()+ ':'+('0' + (myDate.getMinutes())).slice(-2)+ ':'+myDate.getSeconds();
        let employee_id = 1;

        //create restock order
        await execQuery("INSERT INTO restock_orders(id, time_of_order, item_name, amount, price, employee_id, order_unit) VALUES ("+newid+", '" + timenow + "', '" + info[0].name + "', " + req.body["restock-amt"]*info[0]["restock_amount"] + ", "+ info[0]["restock_price"]*req.body["restock-amt"] + ", " + employee_id + ", '" +info[0]["order_unit"]+"');");

        recentRestock = await execQuery("SELECT * FROM restock_orders ORDER BY time_of_order DESC LIMIT 25;");

        //Render Page with updated info
        res.render("manager", {excess:excess, sale:sale, restock:restock, recentRestock:recentRestock, btndisp: "block", disp: "none", sucmsg: "Restock Order Complete!", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
    }else{
        res.render("manager", {excess:excess, sale:sale, restock:restock, recentRestock:recentRestock, btndisp: "block", disp: "none", errmsg: "Error: Could not complete restock order", restock_price: 0, restock_amount: 0, inventory: 0, order_unit: 'NULL' });
    }
});


//Restock Report
router.post('/restock', async (req, res) => { 
    let items = await execQuery("SELECT name, inventory, min_amount, order_unit FROM item"); 

    restock = [];

    for (let i = 0; i <items.length; i++){
        if (items[i]["inventory"] < items[i]["min_amount"]){
            restock.push(items[i]);
        }
    }
    //console.log(restock);
    res.render("manager", {excess:excess, sale:sale, restock:restock, recentRestock:recentRestock, restockmsg: "Report Generated", btndisp: "block", disp:'none'});

});

router.post('/restock-clear', async (req, res) => { 
    restock = [];
    res.render("manager", {excess:excess, sale:sale, restock:restock, recentRestock:recentRestock, restockmsg:"Cleared", btndisp: "block", disp:'none'});
});



//Sales Report
router.post('/sale', async (req, res) => { 
    ids = await execQuery("select id, name from item;");

    sale = [];

    let start = req.body["start-date"];
    let end = req.body["end-date"];


    if (isNaN(Number(new Date(start))) || isNaN(Number(new Date(end)))){
        res.render("manager", {excess:excess, sale:sale, salemsg:"", errmsgsale: "Please enter a valid start and end date", restock:restock, recentRestock:recentRestock, btndisp: "block", disp:'none'});
        return;
    }

    
    for (let i = 0; i < ids.length; i++){
        customerOrders = await execQuery("select * from customer_orders where id in (select co_id from co_to_coi where coi_id in (select coi_id from coi_to_i where i_id = "+ids[i].id+")) and time_of_order BETWEEN '"+start+"' AND '"+end+"'");

        for (let j = 0; j < customerOrders.length; j++){
            customerOrders[j]["name"] = ids[i].name;
            customerOrders[j]["price"] = Math.round(customerOrders[j]["price"]*100) / 100;
            sale.push(customerOrders[j]);
        }
    }

    res.render("manager", {excess:excess, sale:sale, errmsgsale:"", salemsg:"Report Generated", restock:restock, recentRestock:recentRestock, btndisp: "block", disp:'none'});

});

router.post('/sale-clear', async (req, res) => { 
    sale = [];
    res.render("manager", {excess:excess, sale:sale, restock:restock, errmsgsale:"", salemsg:"Cleared", recentRestock:recentRestock, btndisp: "block", disp:'none'});
});




//Excess Report
router.post('/excess', async (req, res) => { 
    item_info = await execQuery("select id, name, inventory, customer_amount from item;");

    excess = [];

    let start = req.body["start-date"];
    let myDate = new Date();
    let end = myDate.getFullYear() + '-' +('0' + (myDate.getMonth()+1)).slice(-2)+ '-' +  ('0' + myDate.getDate()).slice(-2) + ' '+myDate.getHours()+ ':'+('0' + (myDate.getMinutes())).slice(-2)+ ':'+myDate.getSeconds();


    if (isNaN(Number(new Date(start)))){
        res.render("manager", {excess:excess, sale:sale, excessmsg:"", errmsgexcess: "Please enter a valid start date", restock:restock, recentRestock:recentRestock, btndisp: "block", disp:'none'});
        return;
    }
    


    for (let i = 0; i < item_info.length; i++){
        customerOrders = await execQuery("select id from customer_orders where id in (select co_id from co_to_coi where coi_id in (select coi_id from coi_to_i where i_id = "+item_info[i].id+")) and time_of_order BETWEEN '"+start+"' AND '"+end+"'");
        
        let prev_inventory = item_info[i].customer_amount*customerOrders.length + item_info[i].inventory;
        let curr_inventory = item_info[i].inventory;
        let percent = Math.round((1 - (curr_inventory/prev_inventory)) * 10000)/100;

        entry = {name:item_info[i].name, prev_inventory: prev_inventory, curr_inventory:item_info[i].inventory, percent: percent}

        if (percent < 10){
            excess.push(entry);
        }
    }

    res.render("manager", {excess:excess, sale:sale, errmsgexcess:"", excessmsg:"Report Generated", restock:restock, recentRestock:recentRestock, btndisp: "block", disp:'none'});

});

router.post('/excess-clear', async (req, res) => { 
    excess = [];
    res.render("manager", {excess:excess, sale:sale,restock:restock, errmsgexcess:"", excessmsg:"Cleared", recentRestock:recentRestock, btndisp: "block", disp:'none'});
});


router.post('/addItem', async (req, res) => { 
        // console.log((await execQuery("SELECT COUNT(id) FROM item"))[0]);
        let co_id = parseInt((await execQuery("SELECT COUNT(id) FROM item"))[0].count) + 1;

        let order_unit = req.body["order-unit"];
        let name = req.body["name"];
        let type = req.body["type"];

        let itms = await execQuery("SELECT name FROM item");
        let itmName = [];
        for (let i = 0; i < itms.length; i++){
            if (itms[i].name === name){
                res.render("manager", {excess:excess, sale:sale,restock:restock, errmsgadd: "Please enter a non-existent item", excessmsg:"", recentRestock:recentRestock, btndisp: "block", disp:'none'});
                return;
            }
        }
        if (!order_unit || !name || !type || !req.body["restock-price"] || !req.body["customer-amount"] || !req.body["restock-amount"] || !req.body["min-amount"]){
            res.render("manager", {excess:excess, sale:sale,restock:restock, errmsgadd: "Please enter valid information", excessmsg:"", recentRestock:recentRestock, btndisp: "block", disp:'none'});
            return;
        }

        await execQuery("INSERT INTO item(id, name, customer_price, restock_price, customer_amount, restock_amount, order_unit, inventory, type, min_amount) VALUES("
        +co_id+", '"+name+"', "+req.body["customer-price"]+", "+req.body["restock-price"]+", "+req.body["customer-amount"]+
        ", "+req.body["restock-amount"]+", '"+order_unit+"', 0, '"+type+"', " + req.body["min-amount"]+");");   

        res.render("manager", {excess:excess, sale:sale,restock:restock, errmsgexcess:"", addmsg:"Item added successfully", recentRestock:recentRestock, btndisp: "block", disp:'none'});
});



module.exports = router;