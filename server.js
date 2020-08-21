// create an express app
const express = require("express")
const path = require('path')
const serverStatic = require('serve-static');
const fetch = require('node-fetch');
const { captureRejectionSymbol } = require("events");
const { resolve4 } = require("dns");
const { Console } = require("console");
//var Dict = require("collections");
const app = express();

// use the express-static middleware
//app.use(express.static("public"));
//access to server static files.
// use the express-static middleware
app.use(express.static("public"));
app.use(serverStatic('public',{ 'search': ['search.html', 'search.htm'] }))

class globalvars {
    stack = new Array();
    htmlTemplate = new String();
};
//set global variables
const gv = new globalvars();
gv.htmlTemplate = getTemplate("search.html");
var temp = '';

//ROOT route ***************************************************************************************************/
app.get("/", function (req, res) {
	var url = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&name=jordan';
    var tstr = 'Hello World'
    var tv = {"name" : "walt","address":"71 Woodhenge Drive"};

    const p = fetch(url)
        .then(values=>JSONTransform(values))
        .then(values=>getShoeSearchMap(values));
              


    Promise.all([p])
        .then(values =>doMap(values))
        .then(values =>res.send(values));

    //gv.stack.push(tstr);
   // var temp = gv.stack.pop();
    
    //res.send(p.response);
		
});

// SEARCH route   **********************************************************************************************/
app.get("/search?*", (req,res) =>{
    
    //const http =require('http');
    const urlIn=require('url');
    const querystring=require('querystring');
    const baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&';

    
    //get query string parameters.
    const qparms = urlIn.parse(req.url,true).query;
    var qs = "";
    for(var key in qparms)
        qs += key.toString()+"="+qparms[key];
    const q = {qs};
    const url = baseUrl+encodeURI(qs);
    console.log(url);
// 
    const p = fetch(url)
        .then(values=>JSONTransform(values))
        .then(values=>getShoeSearchMap(values))
        .catch(error=>{
            console.log(error);
            res.send("Fatal Error");
        });
  
    Promise.all([p]) 
        .then(values =>doMap(values))
        .then(values =>res.send(values))
        .catch(error=>{
            console.log(error);
            res.send("Fatal Error");
        });
  
  

});


// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));


//function mapToTextTags(data){

//function to map search results page.
//todo: should take the mapping as parm. So html tags : data ie -- img-grid-x : data for call
function getShoeSearchMap(data){
	
    //console.log('Got data');
    var p = new Promise((resolve,reject) => {
        var sneaker;
        var dataSet = {};
        sneakers = data.results;
        for(var i=1;i<=9;i++){
            if(i<=sneakers.length){
                sneaker = sneakers[i-1];
                //console.log(sneaker.title);
                //preloadImage(sneaker.media.thumbUrl,console.log('Image loaded'));
                //document.getElementsByName("grid-"+i.toString())[0].hidden = false;
                dataSet["img-grid-"+i.toString()] = sneaker.media.thumbUrl;
                dataSet["desc-grid-"+i.toString()] = sneaker.title;
                dataSet["rprice-grid-"+i.toString()] = "$" + sneaker.retailPrice;
                dataSet["href-grid-"+i.toString()]= "buysell.html?sneaker="+sneaker.id;
                dataSet["href-grid-"+i.toString()] = "buysell.html?sneaker="+sneaker.id;
                //console.log(i);
            }else{
                    
                dataSet["img-grid-"+i.toString()] = "img/products/shoes/NoImage.jpg";
                dataSet["desc-grid-"+i.toString()]= "";
                dataSet["rprice-grid-"+i.toString()] ="";
                dataSet["href-grid-"+i.toString()]= "";
                dataSet["href-grid-"+i.toString()]="";
                //console.log(i);
            };
        };
        resolve(dataSet)});
        
    return(p);    
};

function doMap(data){
    //console.log('Got data');
    var p = new Promise((resolve,reject) => {
        var html = gv.htmlTemplate;
        var tstr = "";
		for(var key in data[0]) { 
			html = rp(html,"{"+key.toString()+"}",data[0][key].toString());
		}
        resolve(html)});
    return(p);    
};

//******** */
//helper functions
function rp (str,key,value){
    return(str.replace(key,value));
    };
//********************************************************************************************* */
function getTemplate(filename){
    var fs = require('fs');
    //const { RSA_NO_PADDING } = require("constants");
    //var suiHTML ="";
    return(fs.readFileSync(".\\public\\" + filename, 'utf8'));
        //console.log(suiHTML);    
    
}
function JSONTransform(data){
    var p = new Promise((resolve,reject) => {
        resolve(data.json());
        reject(console.log("Error in transform"))});
    return p;
}