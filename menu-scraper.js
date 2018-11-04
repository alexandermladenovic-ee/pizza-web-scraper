const request = require("request");
const cheerio = require("cheerio");
const fs      = require("fs");

let URLs = [];

request("https://onlinepizza.se/city/goteborg", (err, resp, body) => {

  const $ = cheerio.load(body);
  $("li > a").each((i, elem) => {
    URLs.push(`https://onlinepizza.se${$(elem).attr("href")}`);
  });

  for(let i = 0; i < URLs.length; ++i) {
    console.log(URLs[i]);
    setTimeout(()=>scrapeMenu(URLs[i]), 500*i);
  }
});

function scrapeMenu(url) {

  request(url, (err, resp, body) => {

    if(url.startsWith(`https://onlinepizza.se/restaurant/`)) {

    let result = {};

    const $= cheerio.load(body);
    result.name = $(`div[class="vendor-info-main-headline item"] > h1`).text();

    $(`ul[class="dish-list"] > li > div`).each((i, elem) => {
      if((/pizz/mgi).test($(elem).attr("data-menu-category"))) {
        const o = JSON.parse($(elem).attr("data-object"));
        result[o.name] = o.product_variations[0].price;
      }
    });

    fs.appendFile("scraped-menu.json", JSON.stringify(result)+"\n");

  }
  });
}
