const request = require("request");
const cheerio = require("cheerio");
const fs      = require("fs");

const keywords        = ["pizzerior", "göteborg"],
      keywordsEncoded = keywords.map(e => encodeURIComponent(e)).join("+");

const root  = `https://www.hitta.se`;
const path  = `/s%C3%B6k?vad=${keywordsEncoded}&typ=ftg&sida=`;

let resultPaths = [];

(function getResultPaths(page) {
  request(root + path + page, (err, resp, body) => {
    const $ = cheerio.load(body, { decodeEntities: false });

    const resultElements = $(`a[class="link--neutral result-row__link result-row-company__link"]`);
    resultElements.each((i, elem) => resultPaths.push($(elem).attr("href")));

    setTimeout(() => resultElements.length ? getResultPaths(page+1) : scrapeResults(), 1500);
  });
})(1);

function scrapeResults() {

  for(let i = 0; i < resultPaths.length; ++i) {
    setTimeout(() => {
      request(root + resultPaths[i], (err, resp, body) => {
        const $ = cheerio.load(body, { decodeEntities: false });

        let result = {};

        result.name = $(`span[class="heading heading--1"]`).text();

        const URL = $(`a[data-track="homepage"]`).attr("href");
        if(URL) result.url = URL;

        const addressElem = $(`a[class="address__rows--linked"]`);
        if(addressElem.length === 1) {
          const address = addressElem.text().replace(/\\n|\s/g, " ").trim().replace(/\s{2,}/g,' ');
          const addressTokenized = (/(.+)(\d{3})\s+(\d{2})\s+(.*)/gmi).exec(address);
          result.street = addressTokenized[1].trim();
          result.postalCode = [addressTokenized[2],addressTokenized[3]];
          result.city = addressTokenized[4];
        }

        const organisationNumber = $(`div[class="susy-primary--half"] > ul > li > span`).first().text();
        if(organisationNumber) result.organisationNumber = organisationNumber;

        fs.appendFile("scraped-hitta.json", JSON.stringify(result) + "\n");

      });
    }, i * 1000);
  }

}
