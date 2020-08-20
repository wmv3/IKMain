const { default: Axios } = require("axios");

function getEndPoint(url) {
    // Return a new promise.
    //return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
      var req = new XMLHttpRequest();
      req.open('GET', url);
      console.log(url);   
      //sdata = JSON.parse(this.response);
		//request.setRequestHeader("Content-Type", "application/json"); 
		req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          ds = JSON.parse(req.responseText);
          resolve(JSON.parse(req.responseText));
          return ds;
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };
      // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    // Make the request
    req.send();
 };

async function getEP(url){
  
  const axios = require('axios').default;
  axios.get(url)
  .then(function (response){return response});
}   



  exports.getEndPoint = getEndPoint;
  exports.getEP = getEP;