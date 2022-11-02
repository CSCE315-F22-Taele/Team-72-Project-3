/*--------------------JavaScript + ExpressJS TLDR--------------------*/
let x = 20 //dont say "var x = 20" or you'll get shot

/*--------------------Install Express in Linux--------------------*/
/*
1. cd to ur directory
2. sudo apt install npm (if you do not have npm)
3. npm init
4. npm install express --save
*/

/*--------------------Run a .js file--------------------*/
/*
1. In terminal, run: node <src code>.js
OR
2a. Go in package.json
2b. In scripts section you can add the following:   
    "<script name>" : "node <src code>.js"
2c. In terminal, run: npm run <script name>
*/

/*--------------------Installing + using EJS--------------------*/
/*
Motivation: want to depict html files for ur user
1. create folder in directory called "views"
2. npm install ejs --save
3. BONUS :D - install ejs syntax highlighting on vscode
*/

/*--------------------Installing + using PostgreSQL--------------------*/
/*
Motivation: we got to use the db. Project requirment
1. Install postgres package: npm install pg --save
2. Install dotenv: npm install dotenv --save
*/

/*--------------------Creating a Server + Routes--------------------*/
const express = require('express')
const app = express() //creates application to set up the server
const port = 3000 

//use view engine
app.set('view engine', 'ejs')


//Runs the server, listens on port 3000 for requests
app.listen(port, () => {
    console.log(`Put the following url in a web browser: http://localhost:${port}`);
});


//Setting up ROUTES
//There is get, post, put, delete, any http method basically

//Get route
//first arg: path , second arg: function (request, response, next) //next not needed for get
app.get('/', (req, res) => { 
    res.render("index", {number: 21}) //need view engine to output ur views
    //res.send("Howdy!"); //send "Howdy!" to user. So any http get requests to our thingy will result in hi
    //res.status(500).send("Hello") //Send 500 status but chains it with other messages
    //res.download() //downloads file onto ur comp
});


/*--------------------Middleware--------------------*/
app.use(print)
//Request starts from top of js file then goes to bottom
function print(req, res, next){
    console.log("Middleware activated")
    next()
} 
//can also put this in get() etc by doing get('/', print, (req, res)...

/*--------------------Creating Routers--------------------*/
//Check routes folder. Basically, we dont wanna keep all of our gets and stuff here

const userRouter = require("./routes/teammates")

app.use("/teammates", userRouter) //I was lazy and decided to not put /teammates a bunch of times in teammates.js


/*--------------------Something useful--------------------*/
//NOT WORKING

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
