const fs = require('fs');
const inquirer = require('inquirer');
const axios = require('axios');
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

    githubAPICall(userName, response);
 
  });
  //end function
}

function githubAPICall (userName, response) {

  const queryURL = `https://api.github.com/users/` + userName;

  axios
      .get(queryURL, {
        headers: {'Authorization': `token ${process.env.GH_TOKEN}`}
      })
      .then(function (res) {

          console.log(res.data);
        
          generateMD(res, response);

      }).catch(err => console.log(err));

}


function generateMD(res, response) {
  const usersInfo = `
  <img align="right" width="100" height="100" src="${res.data.avatar_url}">

  # ${response.project}

  ## Contributors
  ${response.contributors}
  
  ## Table of Contents
  <li><a href="#description">Description</a></li>  
  <li><a href="#installation">Installation</a></li> 
  <li><a href="#tech">Technology Stack</a></li> 
  <li><a href="#usage">Usage</a></li> 
  <li><a href="#contact">Contact</a></li> 
  <li><a href="#license">License</a></li> 
  <li><a href="#tests">Tests</a></li> 

  <h2 id= "description">Description</h2>
  ${response.description}

  <h2 id= "installation">Installation</h2>
  ${response.installation}
  
  <h2 id= "technology">Technology Stack</h2>
  ${response.technology}

  <h2 id= "usage">Usage</h2>
  ${response.usage}

  <h2 id= "contact">Contact</h2>
  * #### Name: ${res.data.name}
  * #### Github: @[${response.username}](${res.data.html_url})
  * #### Portfolio: [${response.portfolio}](${response.portfolio})
  * #### Email: [${res.data.email}](${res.data.email})
  * #### LinkedIn: www.linkedin.com/in/${response.linkedin}
  
  <h2 id= "license">License</h2>
  ${response.license}

  <h2 id= "tests">Tests</h2>
  ${response.tests}
  `
    fs.writeFile("README.md", usersInfo, function (err) {

      if (err) {
          return console.log(err);
      }
      console.log("Success!");

    });
}

inquireQuestions();
