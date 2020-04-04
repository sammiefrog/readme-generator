const fs = require('fs');
const inquirer = require('inquirer');
const axios = require('axios');
// const dotEnv = require('dotEnv');
require('dotenv').config();

function inquireQuestions () {
  inquirer
  .prompt([
    {
      type: "input",
      message: "What is your name?",
      name: "name"
    },
    {
      type: "input",
      message: "What is your Github Username?",
      name: "username"
    },
    {
      type: "password",
      message: "What is your GitHub password?",
      name: "password"
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
      choices: ["Node.Js", "Express", "JavaScript", "jQuery", "React.js", "React", "GIT", "GitHub", "MongoDB", "MySQL", "Firebase", "Handlebars", "HTML", "CSS", "Bootstrap", "Media Queries", "APIs", "Microsoft Suite", "Heroku", "Command- Line"],
      name: "technology"
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

          // generateMD(response, res);
      }).catch(err => console.log(err));


}


function generateMD(res, response) {
  const usersInfo = `
  <img src="${res.data.avatar_url}" alt="profile photo" style="width:250px;height:250px;float:right;">
  
  # ${response.project}
  
  ## Description
  ${response.description}

  ## Table of Contents
  ${response.table}

  ## Installation
  ${response.installation}
  
  ## Technology Stack
  ${response.technology}

  ## Usage
  ${response.usage}
  
  ## Contributors
  ${response.contributors}
  
  ## Contact
  * #### Name: ${res.data.name}
  * #### Github [${response.username}](${res.data.html_url})
  * #### Portfolio: [link to portfolio](${response.portfolio})
  * #### Email: [${res.data.email}](${res.data.email})
  * #### LinkedIn: www.linkedin.com/in/${response.linkedin}
  
  ## License
  ${response.license}
  ## Tests
  ${response.tests}
  `
    fs.writeFile("README.md", usersInfo, function (err) {

      if (err) {
          return console.log(err);
      }

      console.log("Success!");

    });
}

// githubAPICall();
inquireQuestions();
