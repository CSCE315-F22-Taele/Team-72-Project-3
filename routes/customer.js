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

    res.render("customer", {itemsByType: itemsByType, sectionOrder: globals.customerSectionOrder, categoryGroups: globals.categoryGroups});
});

router.post('/', async (req, res) => { 
    //console.log(req.body.orderItems);

    //Date
    
    let totalPrice = 0;

    let myDate = new Date();
    let time_of_order = myDate.getFullYear() + '-' +('0' + (myDate.getMonth()+1)).slice(-2)+ '-' +  ('0' + myDate.getDate()).slice(-2) + ' '+myDate.getHours()+ ':'+('0' + (myDate.getMinutes())).slice(-2)+ ':'+myDate.getSeconds();

    if (!req.body.orderItems){
        console.log("Error: Please make a selection");
        res.render("customer", {itemsByType: itemsByType, sectionOrder: globals.customerSectionOrder, categoryGroups: globals.categoryGroups});
        return;
    }

    let count = req.body.orderItems.length;
    let keys = req.body.orderItems;

    //co_id and coi_id for customer order
    let co_id = parseInt((await execQuery("SELECT MAX(id) FROM customer_orders"))[0].max) + 1;
    let coi_id = parseInt((await execQuery("SELECT MAX(id) FROM customer_order_items"))[0].max)+1;
    const original_coi_id = coi_id;


    let employee_id = 1; //NEED TO FIX

    //Error Handling (ensuring all combination of items are valid)
    let side_drink_choosen = false;
    let entree_base_choosen = false;
    let protein_choosen = false;
    let topping_choosen = false;

    for (let i = 0; i < count; i++){
        let type = (await execQuery("SELECT type from item where id = '"+keys[i]+"'"))[0].type;

        if (type === "Protein"){
            protein_choosen = true;
        }
        else if(type === "Entree Base"){
            if (entree_base_choosen){
                console.log("Error: Cannot have multiple entree bases");
                res.render("customer", {itemsByType: itemsByType, sectionOrder: globals.customerSectionOrder, categoryGroups: globals.categoryGroups});
                return;
            }
            entree_base_choosen = true;
        }
        else if(type === "Drinks" || type === "Sides"){
            side_drink_choosen = true;
        }else{
            topping_choosen = true;
        }
    }

    /*
    Valid Order Rules:
        If a topping is selected, both a protein and entree base must be selected.
        A protein and entree base must be selected unless a side or drink is selected.
        Only one entree base can be selected.

        === A protein and an entree base must be choosen OR ONLY a side or drink can be choosen
    */
    if(!((protein_choosen && entree_base_choosen) || (!topping_choosen && !protein_choosen && !entree_base_choosen && side_drink_choosen))){
        console.log("Error: Invalid Order");
        res.render("customer", {itemsByType: itemsByType, sectionOrder: globals.customerSectionOrder, categoryGroups: globals.categoryGroups});
        return;
    }

    await execQuery("INSERT INTO customer_order_items(id, name, price) VALUES ("+coi_id +", null, 0)");
    await execQuery("INSERT INTO customer_orders(id, price, time_of_order, employee_id) VALUES ("+co_id+", " + totalPrice + ", '" + time_of_order + "', " + employee_id + ")");


    let mainTop = "";
    let mainPrice = "";
    let proteinID = "";
    let mainEntreeBase = "";
    let mainEntreeBaseID = "";

    let everything = ""

    let chipsInfo = await execQuery("SELECT customer_amount, inventory FROM item where name='Tortilla Chips';");

    for (let i = 0; i < count; i++){

        


        let lst = (await execQuery("SELECT name, customer_price, inventory, customer_amount, type from item where id = '"+keys[i]+"'"));
        totalPrice += lst[0].customer_price;
        let id = keys[i];
        let name = lst[0].name;
        let inventory = lst[0].inventory;
        let customer_amount = lst[0].customer_amount;
        let type = lst[0].type;


        everything += (name + ", ");


        if (type === "Protein"){
            mainTop = name;
            mainPrice = lst[0].customer_price;
            proteinID = id;
        }
        else if(type === "Entree Base"){
            mainEntreeBase = name;
            mainEntreeBaseID = id;
        }
        else if(type === "Drinks" || type === "Sides"){
            coi_id++;
            await execQuery("INSERT INTO customer_order_items(id, name, price) VALUES ("+coi_id+", '" + name + "', " + lst[0].customer_price+")");
            await execQuery("INSERT INTO co_to_coi(co_id, coi_id) VALUES ("+co_id+", " + coi_id +")");
            await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+coi_id+", " + id +")");
        }
        else{
            await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+original_coi_id+", " + id +")");
        }

        //dec inventory

        //prevents negative inventory
        if (inventory - customer_amount <= 0){
            inventory = 0;
            customer_amount = 0;
        }

        //Chips and ... edge case
        if (keys[i].includes("Chips and")){

            let side = keys[i].substring(10);
            if (side === "Guac"){
                side = "Guacamole";
            }
            if (side === "Salsa"){
                side = "Pineapple Salsa";
            }

            let chipAmt = ((chipsInfo[0].inventory - chipsInfo[0].customer_amount) > 0) ? (chipsInfo[0].inventory - chipsInfo[0].customer_amount) : 0;
            await execQuery("UPDATE item SET inventory = "+(chipAmt)+" WHERE name = 'Tortilla Chips'");
            
            let sauceInfo = await execQuery("SELECT customer_amount, inventory FROM item where name='"+ side +"';");

            let sauceAmt = ((sauceInfo[0].inventory - sauceInfo[0].customer_amount) > 0) ? (sauceInfo[0].inventory - sauceInfo[0].customer_amount) : 0;
            await execQuery("UPDATE item SET inventory = "+(sauceAmt)+" WHERE name = '"+ side +"';");

        }
        await execQuery("UPDATE item SET inventory = "+(inventory - customer_amount)+" WHERE name = '"+keys[i]+"'");
    }

    if (mainEntreeBase !== "" && mainTop !== "" && mainPrice !== ""){
        await execQuery("UPDATE customer_order_items SET name = '"+ mainTop + " " + mainEntreeBase + "' WHERE id = '" + original_coi_id+"'");
        await execQuery("UPDATE customer_order_items SET price = "+ mainPrice + " WHERE id = '" + original_coi_id+"'");
    }

    await execQuery("UPDATE customer_orders SET price = "+ totalPrice + " WHERE id = '" + co_id+"'");

    await execQuery("INSERT INTO co_to_coi(co_id, coi_id) VALUES ("+co_id+", " + original_coi_id +")");

    if (proteinID !== "" && mainEntreeBaseID !== ""){
        await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+original_coi_id+", " + proteinID +")");
        await execQuery("INSERT INTO coi_to_i(coi_id, i_id) VALUES ("+original_coi_id+", " + mainEntreeBaseID +")");
    }


    await execQuery("INSERT INTO customer_orders_inprogress(id, price, ingredients) VALUES ("+original_coi_id+ ", " + totalPrice + ", '" + everything.substring(0, everything.length-2) +"');")

    console.log("Order Complete!")
    
    res.render("customer", {itemsByType: itemsByType, sectionOrder: globals.customerSectionOrder, categoryGroups: globals.categoryGroups});
});

module.exports = router;