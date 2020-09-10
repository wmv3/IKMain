// create an express app
const express = require("express")
const path = require('path')
const serverStatic = require('serve-static');
//const fetch = require('node-fetch');
const axios = require('axios').default;
const { Client } = require('pg');
const { captureRejectionSymbol } = require("events");
const { resolve4 } = require("dns");
const { Console } = require("console");
//var Dict = require("collections");
// this is very import to include - making http request possible.
const cors = require('cors');
const { resolve } = require("path");

const app = express();
//const router = express.Router();

// use the express-static middleware
//app.use(express.static("public"));
//access to server static files.
// use the express-static middleware
app.use(express.static("public"));
//app.use(express.static(path.join(__dirname,"public")));
app.use(serverStatic('public',{ 'search': ['search.html', 'search.htm'] }))
// this is very import to include - making http request possible.
app.use(cors());

class globalvars {
    stack = new Array();
    htmlTemplate = new String();
    landingPage = new String();
};
//set global variables
const gv = new globalvars();
gv.htmlTemplate = getTemplate("search.html");
gv.landingPage = getTemplate("index.html")
var temp = '';

//ROOT route ***************************************************************************************************/
app.get("/", function (req, res) {
	var url = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&name=jordan';
    var tstr = 'Hello World'
    var tv = {"name" : "walt","address":"71 Woodhenge Drive"};
    console.log("testing dev");
    res.send(gv.landingPage);

});
// Test route **************************************************************************************************/
//  9/5/2020 -- testing Heroku db connection 
//  REMOVE WHEN DONE 
app.get("/test",function(req,res) {
   
    const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PBPORT || 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {rejectUnauthorized: false}
    });
    var obj ;
    const query = {
        name: 'getuser',
        text: 'select * from getuser($1);',
        values: ['Archie']
      }
      
    client.connect()
    client.query(query)
          .then(result=>{
                 for (let row of result.rows) {
                    // console.log(JSON.stringify(row));
                    //obj=JSON.stringify(row)
                    obj = row.getuser;
                 }
            })
            .catch(err =>console.error('DB execution error', err.stack))
    .then(()=>{console.log("connection closed");
        res.send(JSON.stringify(obj))
        client.end()});
    
    //console.log(JSON.stringify(obj));
    //client.end();
});

// TEST 2 *****************************************************************************************************/

app.get("/test2",(req,res)=>{
    const getsneakers = new Promise((resolve,reject)=>{
        const baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&';
        var inputParms = {name: 'Nike'};
            //need to validate the these parameters
        var searchQuery = baseUrl + jsonToQueryString(inputParms);
            axios.get(searchQuery)
            .then(data=>{return(resolve({'sneakers' : data.data.results}))});
    });
    const getuser = new Promise((resolve,reject)=>{
        const client = new Client({
        host: process.env.PGHOST,
        port: process.env.PBPORT || 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: {rejectUnauthorized: false}
        });
        var obj ;
        const query = {
            name: 'getuser',
            text: 'select * from getuser($1);',
            values: ['Archie']
          }
          
        client.connect()
        client.query(query)
              .then(result=>{
                     for (let row of result.rows) {
                        // console.log(JSON.stringify(row));
                        //obj=JSON.stringify(row)
                        obj = row.getuser;
                     }
                })
                .catch(err =>console.error('DB execution error', err.stack))
        .then(()=>{console.log("connection closed");
            client.end();
            return(resolve({'user' : obj}));
        });
    });
//testing to api calls together -  return the combined set.
// The two functions return promises 
      
    Promise.all([getuser,getsneakers])
    .then(data=>{res.status=200;
        res.send(data);
        res.end()})
    .catch(e=>console.log(e));
        
});
// SEARCH route   **********************************************************************************************/

app.get("/search?*", (req,res) =>{
    
    const baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&';
    console.log(req.query);
    var inputParms = req.query;
    //need to validate the these parameters
   var searchQuery = baseUrl + jsonToQueryString(req.query);
    axios.get(searchQuery)
        .then(data=>{res.status=200;
                     const htmlOut =fillSearchPage(data);
                     res.send(htmlOut)
                     res.end()});
});

// route for api for search data - mapping done client side with this function. 
// this returns a map of data from the sneaker database to name tags of the html - js-clientside will use to replace the data.
// html uses name=tag  data = {tag}, so find tag and replace {tag} with the db data.
app.get("/api-searchdata", function (req,res){

    //var baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&name=nike';
    var baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers'

     //console.log(req.query);
    var inputParms = req.query;
    //need to validate the these parameters looking for injection
   var qs = baseUrl+"?limit=10&releaseYear=gte:2018&" + jsonToQueryString(req.query);
    axios.get(qs)
        .then(getSearchPageMap)
        .then(data => {res.status =200;
            res.header = "Content-Type", "application/json";
            res.send(data);res.end()});

   
});


// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));


//function mapToTextTags(data){

//function to map search results page.
//todo: should take the mapping as parm. So html tags : data ie -- img-grid-x : data for call
// takes full json from sneakerdatabase and maps sneaker db data to HtML tag:  - These tags are in the html file.
// The HTML follows:  name="img-grid-1" src="{img-grid-1}" So this maps to the name.
// in the HTML there is a function that then takes this map and does the data replacement.
function getSearchPageMap(data){
	//console.log('Got data');
    var first = true;
    var sneakers = data.data.results;
    var i = 1;
    var dataSet = {};
	for(sneaker in sneakers){
        if(i<=9){ 
            if(i<=sneakers.length){
                sneaker = sneakers[i-1];
                //console.log(sneaker.title);
                //preloadImage(sneaker.media.thumbUrl,console.log('Image loaded'));
                //document.getElementsByName("grid-"+i.toString())[0].hidden = false;
                dataSet["img-grid-"+i.toString()] = getThumbnail(sneaker.media.thumbUrl);
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
        i++};
    };
    //console.log(dataSet);
    return(dataSet);
};
// this is serverside html build of search page. This is used coming from the landing page (index.html) search to the searchpage.
//  the initial search page is populated from the landing page search returned populated.
function fillSearchPage(jsonData){
    var sneaker;
    var html = gv.htmlTemplate;
    sneakers = jsonData.data.results;
    for(var i=1;i<=9;i++){
        if(i<=sneakers.length){
            sneaker = sneakers[i-1];
            //console.log(sneaker.title);
            //preloadImage(sneaker.media.thumbUrl,console.log('Image loaded'));
            //document.getElementsByName("grid-"+i.toString())[0].hidden = false;
            html = rp(html,"{" +"img-grid-"+i.toString() +"}", sneaker.media.thumbUrl);
            html = rp(html,"{" +"desc-grid-"+i.toString()+"}", sneaker.title);
            html = rp(html,"{" +"rprice-grid-"+i.toString()+"}", "$" + sneaker.retailPrice);
            html = rp(html,"{" +"href-grid-"+i.toString()+"}", "buysell.html?sneaker="+sneaker.id);
            html = rp(html,"{" +"href-grid-"+i.toString()+"}", "buysell.html?sneaker="+sneaker.id);
            //console.log(i);
        }else{
            html = rp(html,"{" +"img-grid-"+i.toString()+"}","img/products/shoes/NoImage.jpg");
            html = rp(html,"{" +"desc-grid-"+i.toString()+"}", "");
            html = rp(html,"{" +"rprice-grid-"+i.toString()+"}","");
            html = rp(html,"{" +"href-grid-"+i.toString()+"}", "");
            html = rp(html,"{" +"href-grid-"+i.toString()+"}","");
            //console.log(i);
        };
    };
    //console.log(html);
    return(html);
}

//********************************************************************************************* */
//helper functions
//********************************************************************************************* */

function rp (str,key,value){
    return(str.replace(key,value));
    };
//********************************************************************************************* */
function getTemplate(filename){
    var fs = require('fs');
    //const { RSA_NO_PADDING } = require("constants");
    //var suiHTML ="";
    return(fs.readFileSync(filename, 'utf8'));
        //console.log(suiHTML);    
 }
//******************************************************************************************** */ 
function jsonToQueryString(parms){
	var jstr;
	var qstr = new String();
	first = true;
	for(x in parms){
		if(first){
				first = false;
				qstr = x.toString() + "=" +encodeURI(parms[x])
			}else{
				qstr += "&" + x.toString() + "=" +encodeURI(parms[x])
		}
	}
	return qstr;
}
function getThumbnail(name){
    	
    if(name != ""){
        return name;
    } else {
        return "img/products/shoes/NoImage.jpg";
    };
};

//END of helper functions.


