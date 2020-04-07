const fs = require('fs');

const generate = { generateMD(res, response) {

    const usersInfo = `# ${response.project}
<img align="left" src="https://img.shields.io/badge/License-${response.license}-green">
<img align="right" width="100" height="100" src="${res.data.avatar_url}">
  
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
<li>Name: ${res.data.name}</li> 
<li>Github: @[${response.username}](${res.data.html_url})</li> 
<li>Portfolio: [${response.portfolio}](${response.portfolio})</li>
<li>Email: [${res.data.email}](${res.data.email})</li> 
<li>LinkedIn: www.linkedin.com/in/${response.linkedin}</li> 
    
<h2 id= "tests">Tests</h2>
${response.tests} `
      fs.writeFile("README.md", usersInfo, function (err) {
  
        if (err) {
            return console.log(err);
        }
        console.log("Success!");
  
      });
  }
}

module.exports = generate;
