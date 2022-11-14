const express = require("express");
const { pool, execQuery } = require("../modules/execQuery");
const globals = require("../modules/globals");

const router = express.Router();

var itemsByType = [];

const getItems = async (req, res, next) => {
    req.body.items = await execQuery("SELECT * FROM item");
    next();
}

router.get('/', getItems, (req, res) => { 
    itemsByType = req.body.items.reduce((groups, item) => {
        const group = (groups[item.type] || []);
        group.push(item);
        groups[item.type] = group;
        return groups;
    }, {});

    res.render("customer", {itemsByType: itemsByType, sectionOrder: globals.customerSectionOrder});
});

router.post('/', async (req, res) => { 
    let totalPrice = 0

    //Date
    let myDate = new Date();
    let time_of_order = myDate.getFullYear() + '-' +('0' + (myDate.getMonth()+1)).slice(-2)+ '-' +  ('0' + myDate.getDate()).slice(-2) + ' '+myDate.getHours()+ ':'+('0' + (myDate.getMinutes())).slice(-2)+ ':'+myDate.getSeconds();
    

    let count = Object.keys(req.body).length;
    let keys = Object.keys(req.body)

    //co_id and coi_id for customer order
    let co_id = parseInt((await execQuery("SELECT MAX(id) FROM customer_orders"))[0].max) + 1;
    let coi_id = parseInt((await execQuery("SELECT MAX(id) FROM customer_order_items"))[0].max)+1;
    const original_coi_id = coi_id;


    let employee_id = 1; //NEED TO FIX

    await execQuery("INSERT INTO customer_order_items(id, name, price) VALUES ("+coi_id +", null, 0)");
    await execQuery("INSERT INTO customer_orders(id, price, time_of_order, employee_id) VALUES ("+co_id+", " + totalPrice + ", '" + time_of_order + "', " + employee_id + ")");


    let mainTop = ""
    let mainPrice = ""
    let proteinID = ""
    let mainEntreeBase = ""
    let mainEntreeBaseID = ""

    for (let i = 0; i < count; i++){

        //edge case for chip names
        //console.log(keys[i])

        let lst = (await execQuery("SELECT id, customer_price, inventory, customer_amount, type from item where name = '"+keys[i]+"'"))
        totalPrice += lst[0].customer_price
        let id = lst[0].id
        let inventory = lst[0].inventory
        let customer_amount = lst[0].customer_amount
        let type = lst[0].type

        // console.log(id)
        // console.log(inventory)
        // console.log(customer_amount)
        // console.log(type)

        if (type === "Protein"){
            mainTop = keys[i]
            mainPrice = lst[0].customer_price
            proteinID = id
        }
        else if(type === "Entree Base"){
            mainEntreeBase = keys[i]
            mainEntreeBaseID = id
        }
        else if(type === "Drinks" || type === "Sides"){
            coi_id++
            await execQuery("INSERT INTO customer_order_items(id, name, price) VALUES ("+coi_id+", '" + keys[i] + "', " + lst[0].customer_price+")");
            await execQuery("INSERT INTO co_to_coi(co_id, coi_id) VALUES ("+co_id+", " + coi_id +")");
            await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+coi_id+", " + id +")");
        }
        else{
            await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+original_coi_id+", " + id +")");
        }


        //dec inventory
        await execQuery("UPDATE item SET inventory = "+(inventory - customer_amount)+" WHERE name = '"+keys[i]+"'")
    }

    /*Object.keys(req.body).forEach(async element =>{
        console.log(element)
        totalPrice += (await execQuery("SELECT customer_price from item where name = '"+element+"'"))[0].customer_price
        console.log(totalPrice)
    })*/

    //totalPrice += (await execQuery("SELECT customer_price from item where name = '"+element+"'"))[0].customer_price

    await execQuery("UPDATE customer_order_items SET name = '"+ mainTop + " " + mainEntreeBase + "' WHERE id = '" + original_coi_id+"'");
    await execQuery("UPDATE customer_order_items SET price = "+ mainPrice + " WHERE id = '" + original_coi_id+"'");
    await execQuery("UPDATE customer_orders SET price = "+ totalPrice + " WHERE id = '" + co_id+"'");

    //console.log("Got here!")
    await execQuery("INSERT INTO co_to_coi(co_id, coi_id) VALUES ("+co_id+", " + original_coi_id +")");
    //console.log("Got here! 2")
    await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+original_coi_id+", " + proteinID +")");
    //console.log("Got here! 3")
    await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+original_coi_id+", " + mainEntreeBaseID +")");

    res.render("customer", {itemsByType: itemsByType}) 
});

module.exports = router;