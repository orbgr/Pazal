// imports
let path = require('path');
let express = require('express');
let fs = require('fs');
let app = express();
let mongo = require('mongodb').MongoClient;

//init
let client;
let db;
let dupRecepies = [];
let receipes = {};

app.use(express.static(path.join(__dirname)));

//routers

app.get('/',(req,res) => {res.sendFile(__dirname + '/index.html')});

app.get('/search', (req,res) => {
        let params = req.query;
        let ingredients = Object.keys(params)
        ingredients = ingredients.map(function(x) { return new RegExp('\\b' + x + '\\b', 'i'); });
        db.collection('recipies').aggregate([
            {$unwind: "$nut_main"},
            {$match: {nut_main: { $in: ingredients }}},
            {$group: { _id : "$url" , name : { $first: '$name' }, nutrition : { $first: '$nutrition' },
            nut_main: { $push: '$nut_main' }, nut_sec: { $first: '$nut_sec' }, url: { $first: '$url' },
            image : { $first: '$image' }, count: { $sum: 1 } }},
            {$sort: {count: -1}},
            {$limit : 6 }
            ]).toArray((err, result) => {
                if (err) {
                    res.status(500).send(err);
                    res.end();
                } 
                res.setHeader("Content-Type", "text/html");
                res.send(result);
                res.end();
              });      
});


// connections
app.listen(8001, (err, res) => {
    if (err) {
        console.log("-E- SERVER ERROR:" + err);
        return;
    }
    
    mongo.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, cli) => {
        if (err) {
            console.log("-E- DB ERROR:" + err);
            return;
        } 
        console.log('Connected successfully to database');
        client = cli;
        db = client.db('Tavshil');
    });
    console.log('server started');
});
