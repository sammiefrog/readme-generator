const axios = require('axios');
const genMD = require('./generateMD');
require('dotenv').config();

const api = { githubAPICall (userName, response) {

    const queryURL = `https://api.github.com/users/` + userName;
  
    axios
        .get(queryURL, {
          headers: {'Authorization': `token ${process.env.GH_TOKEN}`}
        })
        .then(function (res) {
  
            console.log(res.data);
          
            genMD.generateMD(res, response);
  
        }).catch(err => console.log(err));
  
  }
};

  module.exports = api;