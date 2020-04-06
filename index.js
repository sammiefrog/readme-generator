const inquirer = require('inquirer');
const apiCall = require('./api');
// const genMD = require('./generateMD');
require('dotenv').config();

function inquireQuestions () {
  inquirer
  .prompt([
    {
      type: "input",
      message: "What is your Github Username?",
      name: "username"
    },
    {
      type: "input",
      message: "What is your project's title?",
      name: "project"
    },
    {
      type: "input",
      message: "Who contributed to the project?",
      name: "contributors"
    },
    {
      type: "input",
      message: "Please enter a description of your project?",
      name: "description"
    },
    {
      type: "input",
      message: "Enter Installation requirements:",
      name: "installation"
    },
    {
      type: "checkbox",
      message: "What technologies did you use?",
      choices: [" Node.Js", " Express", " JavaScript", " jQuery", " React.js", " React", " GIT", " GitHub", " MongoDB", " MySQL", " Firebase", " Handlebars", " HTML", " CSS", " Bootstrap", " Media Queries", " APIs", " Microsoft Suite", " Heroku", " Command- Line"],
      name: "technology"
    },
    {
      type: "input",
      message: "Please enter Usage:",
      name: "usage"
    },
    {
      type: "list",
      message: "What license do you want to use?",
      choices: ['MIT', 'ISC', 'Apache', 'GPL', 'BSD'],
      name: "license"
    },
    {
      type: "input",
      message: "Enter any tests:",
      name: "tests"
    },
    {
      type: "input",
      message: "What is you linked-in username?",
      name: "linkedin"
    },
    {
      type: "input",
      message: "What is your portfolio link?",
      name: "portfolio"
    },
  ])
  .then(function(response) {

    let userName = response.username;

    apiCall.githubAPICall(userName, response);
 
  });
  //end function
}

inquireQuestions();

// module.exports = inquireQuestions();
