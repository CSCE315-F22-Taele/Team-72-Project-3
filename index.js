//Creates application to set up the server
const express = require('express')
const app = express()
const port = 3000 

//use view engine
app.set('view engine', 'ejs')


//Runs the server, listens on port 3000 for requests
app.listen(port, () => {
    console.log(`Put the following url in a web browser: http://localhost:${port}`);
});


//Setting up ROUTES
app.get('/order', (req, res) => { 
    res.render("order") 
})

app.get('/manager', (req, res) => { 
    res.render("manager") 
})

app.get('/server', (req, res) => { 
    res.render("server") 
})
    
    
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


app.get('/price', (req, res) => {
    prices = []
    pool.query("SELECT name,customer_price from item;")
    .then(query_res => {
        
        for (let i = 0; i < query_res.rowCount; i++){
            prices.push(query_res.rows[i])
        }
        const data = {prices: prices}
        res.render('pricesDepict', data)
    }).catch((error) => {
        console.log(error);
      });

})
