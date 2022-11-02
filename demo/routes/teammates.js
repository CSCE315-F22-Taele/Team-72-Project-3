//This file encapsulates everything dealing with the /teammates path then import into main
//Good practice to do this (also making file called routes)

const express = require("express")
const router = express.Router() //kinda like a mini-app. Can be independent of main router

router.get('/Conrad', (req,res) =>{
    res.json({name: "corn"})
});

router.get('/Carson', (req,res) =>{
    res.json({name: "carbs"})
});

router.get('/Jake', (req,res) =>{
    res.sendStatus(500) //Send status codes
});

//Dynamic parameters (basically)
//now do http://localhost:3000/teammates/<put a number here!>
router.get('/:id', (req,res) =>{
    res.send(`You put #${req.params.id}`)
});

//make sure test.js can get access to it
module.exports = router