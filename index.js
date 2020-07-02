#!/usr/bin/env node

const chalk = require("chalk");
const boxen = require("boxen");
const inquirer = require("inquirer");
const cheerio = require("cheerio");
const got = require("got");

const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: "single",
  borderColor: "green",
  align: "center",
  dimBorder: true,
  float: "center",
};

accentsTidy = function (s) {
  var r = s.toLowerCase();
  r = r.replace(new RegExp(/\s/g), "");
  r = r.replace(new RegExp(/[àáâãäå]/g), "a");
  r = r.replace(new RegExp(/æ/g), "ae");
  r = r.replace(new RegExp(/ç/g), "c");
  r = r.replace(new RegExp(/[èéêë]/g), "e");
  r = r.replace(new RegExp(/[ìíîï]/g), "i");
  r = r.replace(new RegExp(/ñ/g), "n");
  r = r.replace(new RegExp(/[òóôõö]/g), "o");
  r = r.replace(new RegExp(/œ/g), "oe");
  r = r.replace(new RegExp(/[ùúûü]/g), "u");
  r = r.replace(new RegExp(/[ýÿ]/g), "y");
  r = r.replace(new RegExp(/\W/g), "");
  return r;
};

inquirer
.prompt([
    {
    type: "input",
    name: "word",
    message: "Palavra:",
    },
])
.then((answers) => {
    var word = answers.word;
    getResponses(word);
})
.catch((error) => {
    if (error.isTtyError) {
    // Prompt couldn't be rendered in the current environment
    } else {
    // Something else when wrong
    }
});


var getResponses = function (word) {
    function option(url, name, string) { 
        this.url = url; 
        this.name = name; 
        this.string = string;
     } 
  const priberamURL = new option("https://dicionario.priberam.org/" + word, "PRIBERAM", "#resultados");
  const infopediaURL = new option("https://www.infopedia.pt/dicionarios/lingua-portuguesa/" + word, "INFOPEDIA", ".QuadroDefinicao");
  const sinonimosURL = new option("https://www.sinonimos.com.br/" + accentsTidy(word), "SINONIMOS", ".palavra-small");
  const informalURL = new option("https://www.dicionarioinformal.com.br/" + word, "INFORMAL");

  var list = [priberamURL,infopediaURL,sinonimosURL];

  list.forEach(element => {
    got(element.url)
    .then((response) => {
      const $ = cheerio.load(response.body);

      var string = $(element.string)
        .text()
        .replace(/([\s\S])* Experimente!/, "")
        .replace( /[0-9]./g, "")
        .replace("SINÓNIMOS", "\nSINÓNIMOS\n")
        .replace("ANTÓNIMOS", "\nANTÓNIMOS\n")
        .replace(/\n+/g, "\n")
        .replace(/([\s\S])* Compartilhar/, "")
        .replace(/\./g, "\n")
        .replace(/:/g, "\n")
        .replace(/\n+/g, "\n")
        .trim()
        .toString();

      const chalk_string = chalk.white(element.name + "\n\n" + string);

      const msgBox = boxen(chalk_string, boxenOptions);

      console.log(msgBox);
    })
    .catch((err) => {
      console.log(err);
    });
  });
}
