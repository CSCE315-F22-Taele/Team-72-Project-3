//Creates application to set up the server
const express = require('express')
const app = express()
const port = 3000 

//use view engine
app.set('view engine', 'ejs')

/*--------------------DB CONNECTION--------------------*/
//Import pg and dotenv packages
const { Pool } = require('pg')
const { query } = require('express')
const dotenv = require('dotenv').config()

//Query pool
const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USR,
    database: process.env.DB,
    password: process.env.PSWD,
    port: process.env.PORT,
    ssl: {rejectUnauthorized: false}
})

process.on('SIGINT', () =>{
    pool.end()
    console.log("Sucessfully shutdown")
    process.exit(0)
})


//Executes a SQL Query
function execQuery(cmd){
    return new Promise( (resolve, reject) => {
        output = []
        pool.query(cmd)
        .then(query_res => {
            for (let i = 0; i < query_res.rowCount; i++){
                output.push(query_res.rows[i])
            }
            resolve(output)
        }).catch((error) => {
            console.log(error)
            reject(error);
        })
    })
    
}

/*----------------------------------------*/

//Runs the server, listens on port 3000 for requests
app.listen(port, () => {
    console.log(`Put the following url in a web browser: http://localhost:${port}`);
});


//https://www.geeksforgeeks.org/how-to-dynamically-add-html-content-when-documents-are-inserted-in-collection-using-node-js/
//Get a Customer Order
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

const data = [{price: 0}]


app.get('/order', (req, res) => { 
    res.render("order", {data: data}) 
})

app.post('/order', async (req, res) => { 
    let totalPrice = 0

    let count = Object.keys(req.body).length;
    let keys = Object.keys(req.body)

    for (let i = 0; i < count; i++){

        //edge case for chip names

        let lst = (await execQuery("SELECT customer_price, inventory, customer_amount from item where name = '"+keys[i]+"'"))
        totalPrice += lst[0].customer_price
        let inventory = lst[1].inventory
        let customer_amount = lst[2].customer_amount

        await execQuery("UPDATE item SET inventory = '"+(inventory - customer_amount)+"' WHERE name = '"+keys[i]+"'")
    }

    /*Object.keys(req.body).forEach(async element =>{
        console.log(element)
        totalPrice += (await execQuery("SELECT customer_price from item where name = '"+element+"'"))[0].customer_price
        console.log(totalPrice)
    })*/

    //totalPrice += (await execQuery("SELECT customer_price from item where name = '"+element+"'"))[0].customer_price

    data[0] = {price: totalPrice};
    res.render("order", {data: data}) 
})


//Setting up ROUTES
app.get('/manager', (req, res) => { 
    res.render("manager") 
})



app.get('/server', (req, res) => { 
    res.render("server") 
})


app.get('/price', async (req, res) => {
    const prices = await execQuery("SELECT name,customer_price from item;")
    const data = {prices: prices}
    res.render('manager', data)
})
    


