#!/usr/bin/env node

const chalk = require("chalk");
const inquirer = require("inquirer");
const { spawn } = require("child_process");

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

function option(url, uses) {
  this.url = url;
  this.uses = uses;
}

function getResponses(word, opt) {
  const priberamURL = new option("https://dicionario.priberam.org/" + word, [
    "Definição",
  ]);
  const infopediaURL = new option(
    "https://www.infopedia.pt/dicionarios/lingua-portuguesa/" + word,
    ["Definição"]
  );
  const sinonimosURL = new option(
    "https://www.sinonimos.com.br/" + accentsTidy(word),
    ["Sinónimos"]
  );
  const informalURL = new option(
    "https://www.dicionarioinformal.com.br/" + word,
    ["Rimas", "Sinónimos", "Antónimos", "Definição"]
  );

  var list = [priberamURL, infopediaURL, sinonimosURL, informalURL];

  var selection = new Set();

  list.forEach((element) => {
    opt.forEach((optss) => {
      if (element.uses.indexOf(optss) > -1) {
        selection.add(element.url);
      }
    });
  });

  if (selection.size == 0) return;

  const ls = spawn("chromium", ["--new-window"].concat([...selection]));

  // ls.stdout.on("data", (data) => {
  //   console.log(`stdout: ${data}`);
  // });

  ls.on("close", (code) => {
    if (code != 0) console.log(`child process exited with code ${code}`);
  });

  return ls;
}
function repeatable() {
  var process;

  inquirer
    .prompt([
      {
        type: "input",
        name: "word",
        message: chalk.green("Palavra:"),
      },
      {
        type: "checkbox",
        name: "option",
        message: "Pesquisar por:",
        choices: ["Definição", "Sinónimos", "Antónimos", "Rimas"],
      },
    ])
    .then((answers) => {
      var word = answers.word;
      process = getResponses(word, answers.option);
    })
    .catch((error) => {
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
        console.log("ERROR Tty");
      } else {
        // Something else when wrong
        console.log("ERROR", error);
      }
    })
    .finally(() => {
      repeatable();
    });
}

repeatable();
