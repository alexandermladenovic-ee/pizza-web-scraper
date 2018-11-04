const request = require("request");
const cheerio = require("cheerio");
const fs      = require("fs");

const keywords        = ["pizzerior", "göteborg"],
      keywordsEncoded = keywords.map(e => encodeURIComponent(e)).join("+");

const root  = `https://gulasidorna.eniro.se`;
const path  = `/hitta:${keywordsEncoded}/p:`;

let i = 1;

(function getResults(page) {
  request(root + path + page, (err, resp, body) => {
    const $ = cheerio.load(body, { decodeEntities: false });

    $(`article`).each((i, elem) => {
      let result = {};

      const nameElem = $(elem).find(`a[class="stripped-link lightblue-link profile-page-link addax addax-cs_hl_hit_company_name_click"]`);
      result.name = nameElem.text().slice(0,-1);
      result.legalLink = nameElem.attr("href");

      const menu = $(elem).find(`a[title="Meny"]`),
            home = $(elem).find(`a[title="Hem"]`),
            link = $(elem).find(`a[class="hit-homepage-link lightblue-link stripped-link addax addax-cs_hl_hit_homepagelink_click"]`);

      if(menu.length)
        result.url = menu.attr("href");
      else if (home.length)
        result.url = home.attr("href");
      else if(link.length)
        result.url = link.attr("href");

      result.street = $(elem).find(`span[class="street-address"]`).text();
      result.postalCode = $(elem).find(`span[class="postal-code"]`).text();
      result.city = $(elem).find(`span[class="locality"]`).text();

        if(result.name && !(/sushi/i).test(result.name)) fs.appendFile("scraped-eniro.json", JSON.stringify(result) + "\n")
    });

    $("article").length != 1 ? setTimeout(() => getResults(page+1), 1000) : null;
  });
})(1);
