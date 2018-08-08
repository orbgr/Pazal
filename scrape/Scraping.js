// importing
const rp  = require('request-promise');
let cheerio = require('cheerio');
let path = require('path');
let fs = require("fs");
let mongo = require('mongodb').MongoClient;

// init
let text = fs.readFileSync("./urls.txt", "utf-8");
let links = text.split("\n");
links = [...new Set(links)];
let all = [];
let ps = [];



// Scraping - foreach link we got promise (adden to ps array).
links.forEach(link => {
    let dict = { 'url': '' ,'name': '' , 'image':'', 'nut_main':[] , 'nut_sec':[] , 'nutrition':{} };

    let web = {
        url: link,
        transform: body => cheerio.load(body)
    }
    ps.push(rp(web));
    rp(web).then($ => {
            dict.url = link;
            dict.name = $("[class='fela-1qd1muk fela-98xdn8'] > h1").html();
            dict.image = $("[class='fela-1b1idjb']").attr('src') ; 
            $("[class='fela-z7wz1t fela-14a79rr'] > div > div:nth-child(4) > div").each((index, element) => {
                let n = $(element).find('div:nth-child(2) > p:nth-child(2)').html();
                if (!n) {
                    dict['nut_main'].push(n);
                } else {
                    n = n.replace(/[^A-Za-z]+/g,"");
                    dict['nut_main'].push(n.substring(0,30));
                }
            });
            $("[class='fela-z7wz1t fela-14a79rr'] > div > div:last-child > div > div").each(function (index, element) {
                dict['nut_sec'].push($(element).find('div:last-child > p:nth-child(2)').html());
            });
            $("[class='fela-z7wz1t fela-12gmaxj'] > div > div:last-child > div").not('div:last-child').each((index, element) => {
                let nut_key = ($(element).find('span:first-child').html());
                let nut_val = ($(element).find('span:last-child').html());
                dict.nutrition[nut_key] = nut_val;
            });
            all.push(dict);
            console.log("-I- End Process of link: " + link);
    });
// handling the promises array -> pushing data to DB.
});
 Promise.all(ps).then(() => {
    console.log("-I- End scraping. Now it's the DB turn");
    mongo.connect('mongodb://localhost:27017', (err, client) => {
        if (err) {
            console.log(err);
        } 
        console.log('Connected successfully to database');
        let db = client.db('Tavshil');
        let collection = db.collection('recipies');
        collection.insertMany(all, (err, result) => {
            if (err) {
                console.log("ERROR: " + err);
            } else {
                console.log(`Inserted  ${result.result.n}  records`);
            }
            client.close();
            });
        });
    });
