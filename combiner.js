const Map     = require('es6-map');
const request = require("request");
const ldj     = require("ldjson-stream");
const fs      = require("fs");
const cheerio = require("cheerio");
const deasync = require("deasync");

let pizzaMap = new Map();

fs.createReadStream('scraped-eniro-legal.json').pipe(ldj.parse()).on('data', pizzeria => {

  if(pizzeria.organisationNumber) pizzaMap.set(pizzeria.organisationNumber, pizzeria);

}).on("end", () => {

  fs.createReadStream('scraped-hitta.json').pipe(ldj.parse()).on('data', pizzeria => {
    if(pizzeria.organisationNumber) {
      if(pizzaMap.has(pizzeria.organisationNumber)) {
        let m = Object.assign(pizzeria, pizzaMap.get(pizzeria.organisationNumber));
        m.street = pizzeria.street;
        pizzaMap.set(pizzeria.organisationNumber, m);
      }
      else pizzaMap.set(pizzeria.organisationNumber, pizzeria);
    }
  });

}).on("end", () => pizzaMap.forEach((val, key, m) => fs.appendFile("combined-scrapes.json", JSON.stringify(val)+"\n")));
