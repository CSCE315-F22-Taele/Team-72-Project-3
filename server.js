//Creates application to set up the server
const express = require('express')
const app = express()
const port = 3000;

const fs = require('fs');

//use view engine
app.set('view engine', 'ejs')

/*--------------------DB CONNECTION--------------------*/
//Import pg and dotenv packages
const { Pool } = require('pg')
const { query } = require('express')
const dotenv = require('dotenv').config()


const { pool, execQuery } = require("./modules/execQuery");

process.on('SIGINT', () =>{
    pool.end()
    console.log("Sucessfully shutdown")
    process.exit(0)
})


/*----------------------------------------*/

//Runs the server, listens on port 3000 for requests
app.listen(port, () => {
    console.log(`Put the following url in a web browser: http://localhost:${port}/customer`);
});


//https://www.geeksforgeeks.org/how-to-dynamically-add-html-content-when-documents-are-inserted-in-collection-using-node-js/
//Get a Customer Order
const bodyParser = require('body-parser')
app.use(express.static("./public"));    // imports the static files used for frontend styling
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/price', async (req, res) => {
    const prices = await execQuery("SELECT name,customer_price from item;")
    const data = {prices: prices}
    res.render('manager', data)
})




// CONNECT ROUTES
fs.readdir("./routes", (err, files) => {
    files.forEach(file => {
        var routeName = file.split(".")[0];
        var router = require(`./routes/${routeName}`);
        app.use(`/${routeName}`, router);
    });
});