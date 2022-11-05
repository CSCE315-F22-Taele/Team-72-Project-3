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
            reject(error);
        })
    })
    
}

/*----------------------------------------*/

//Runs the server, listens on port 3000 for requests
app.listen(port, () => {
    console.log(`Put the following url in a web browser: http://localhost:${port}`);
});


//Setting up ROUTES
app.get('/order', (req, res) => { 
    res.render("order") 
})

/*app.get('/manager', (req, res) => { 
    res.render("manager") 
})*/

app.get('/server', (req, res) => { 
    res.render("server") 
})


app.get('/price', async (req, res) => {
    const prices = await execQuery("SELECT name,customer_price from item;")
    const data = {prices: prices}
    res.render('manager', data)
})
    


