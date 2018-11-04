const request = require("request");
const ldj     = require("ldjson-stream");
const fs      = require("fs");
const cheerio = require("cheerio");

const root = `https://www.svd.se/naringsliv/sok-foretag/home.html?query=`,
      tail = `&target=company`;

let i = 1;

fs.createReadStream('combined-scrapes.json').pipe(ldj.parse()).on('data', pizzeria => {
  request(root + pizzeria.organisationNumber + tail, (err, resp, body) => {
    const id = (/<a class="UtilityLink UtilityLink--serif js-link"\s+href="companyInfo\.html\?companyid=(.+)">/gmi).exec(body);

    if(id) {
    request(`https://www.svd.se/naringsliv/sok-foretag/companyInfoKeyFigures.html?companyid=${id[1]}`, (err, resp, body) => {
      if(!err && resp.statusCode === 200) {
        const $ = cheerio.load(body);
        $("tbody > tr").each((i, elem) => {
          pizzeria[$(elem).find("th").text().trim()] = $(elem).find("td").last().text().trim();
        });
        fs.appendFile("combined-economy.json", JSON.stringify(pizzeria)+"\n");
      }
    });
  }
  });
});
