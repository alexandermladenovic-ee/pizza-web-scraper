const ldj     = require("ldjson-stream");
const request = require("request");
const fs      = require("fs");

const root  = `https://gulasidorna.eniro.se`;

fs.createReadStream('scraped-eniro.json').pipe(ldj.parse()).on('data', pizzeria => {

request(`${root}${pizzeria.legalLink}`, (err, resp, body) => {
  const legalName = (/<dt>Juridiskt namn:<\/dt>\s+<dd>(.+)<\/dd>/gmi).exec(body);
  if(legalName) pizzeria.legalName = legalName[1];

  const organisationNumber = (/<dt>Org\.nr:<\/dt>\s+<dd>(.+)<\/dd>/gmi).exec(body);
  if(organisationNumber) pizzeria.organisationNumber = organisationNumber[1].replace("-", "");

  delete pizzeria.legalLink;

  fs.appendFile("scraped-eniro-legal.json", JSON.stringify(pizzeria)+"\n");
});

});
