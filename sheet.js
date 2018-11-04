const XLSX = require("xlsx");
const fs   = require("fs");
const ldj  = require("ldjson-stream");

let pizzerias = [];

fs.createReadStream(`scraped-eniro-legal.json`).pipe(ldj.parse()).on('data', pizzeria => {
  pizzerias.push(pizzeria);
}).on("end", () => {
  let wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pizzerias));
  XLSX.writeFile(wb, 'eniro.xlsb');
});
