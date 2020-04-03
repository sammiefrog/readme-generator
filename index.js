const fs = require('fs');
const inquirer = require('inquirer');
const axios = require('axios');
const datafire = require('datafire');

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

    // console.log(response);

      const usersInfo = `
          # ${response.project}
    
          ## Description
          ${response.description}
    
          ## Technology Stack
          ${response.technology}
    
          ## Contributors
          ${response.contributors}
    
          ## Contact
          * #### Name: ${response.name}(@${response.username})
          * #### Portfolio: ${response.portfolio}
          * #### Email: []()
          * #### LinkedIn: www.linkedin.com/in/${response.linkedin}
    
          ## License
          ${response.license}
        `
      fs.writeFile("README.md", usersInfo, function(err) {
        
        if (err) {
          return console.log(err);
        }
      
        console.log("Success!");
      
      });
 
  });
  //end function
}



function githubAPICall () {

    const queryUrl = `https://api.github.com/zen`;
    // ${username}/repos?per_page=100
    axios
      .get(queryUrl)
      .then(function(res) {
        console.log(res.data);
        
    

      }).catch(function(err){

        console.log(err);

      });

    //end function
}
// githubAPICall();
inquireQuestions();


            // fs.writeFile('log.txt', JSON.stringify(response), function(err) {
    //     if (err) {
    //         console.log('error');
    //     }
    //     else{
    //         console.log('success');
    //     }
    // })   