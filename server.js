// create an express app
const express = require("express")
const path = require('path')
const serverStatic = require('serve-static');
const fetch = require('node-fetch');
const axios = require('axios').default;
const { captureRejectionSymbol } = require("events");
const { resolve4 } = require("dns");
const { Console } = require("console");
//var Dict = require("collections");
// this is very import to include - making http request possible.
const cors = require('cors');

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

    res.send(gv.landingPage);

/*    const p = fetch(url)
        .then(values=>JSONTransform(values))
        .then(values=>getShoeSearchMap(values));
              


    Promise.all([p])
        .then(values =>doMap(values))
        .then(values =>res.send(values));

    //gv.stack.push(tstr);
   // var temp = gv.stack.pop();
    
    //res.send(p.response);
	*/	
});

// SEARCH route   **********************************************************************************************/
/*  old one - 8/27/2020
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
*/
app.get("/search?*", (req,res) =>{
    
    const baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&';
    console.log(req.query);
    var inputParms = req.query;
    //need to validate the these parameters
   var qs = baseUrl + jsonToQueryString(req.query);
    axios.get(qs)
        .then(data=>{res.status=200;
                     const htmlOut =fillSearchPage(data);
                     res.send(htmlOut)
                     res.end()});
});

// route for api for search data - mapping done client side with this function. 
app.get("/api-searchdata", function (req,res){
/** GET /api-status - Check service status **/
//router.get('api-searchdata', (req, res) =>{
//  res.json({
//    status: "ok"
//  })
//);
    
    //const http =require('http');
   // const urlIn=require('url');
    //const querystring=require('querystring');
    //var baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers?limit=10&page=1&releaseYear=gte:2018&name=nike';
    var baseUrl = 'https://api.thesneakerdatabase.com/v1/sneakers'

 /*   
    //get query string parameters.
    const qparms = urlIn.parse(req.url,true).query;
    var qs = "";
    for(var key in qparms)
        qs += key.toString()+"="+qparms[key];
    const q = {qs};
    const url = baseUrl+encodeURI(qs);
    console.log(url);
*/
    console.log(req.query);
    var inputParms = req.query;
    //need to validate the these parameters
   var qs = baseUrl+"?limit=10&releaseYear=gte:2018&" + jsonToQueryString(req.query);
    axios.get(qs)
        .then(getSearchPageMap)
        .then(data => {res.status =200;
            res.header = "Content-Type", "application/json";
            res.send(data);res.end()});

    //console.log(resp.data);
   //      var p = fetch(baseUrl)
       //  .then(data = resnse.json())    //(returnValues => AllinOne(returnValues))
     //   .then(JSONTransform)
       // .then(getShoeSearchMap)
       // .then(values=>{res.send(values)})
       // .catch(error=>{console.log(error);
       //     res.send("Fatal Error");})
    
     //  .then(data=>res.send(data));         
    
     /*
    Promise.all([p]) 
        //.then(values =>doMap(values))
        // just sending back dictionary to do mapping.
        .then(values =>res.json(values) )
        .catch(error=>{
            console.log(error);
            res.status(404).res.send("Fatal Error");
        });
  
  */

});


// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));


//function mapToTextTags(data){

//function to map search results page.
//todo: should take the mapping as parm. So html tags : data ie -- img-grid-x : data for call
function getSearchPageMap(data){
	console.log('Got data');
    var first = true;
    var sneakers = data.data.results;
    var i = 1;
    var dataSet = {};
	/*var str = new String();
	var cstr = new String();
	var first = true;  */
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
    console.log(dataSet);
    return(dataSet);
};
function doMap(data){
    var html = gv.htmlTemplate;
    var tstr = "";
	for(var key in data[0]) { 
			    html = rp(html,"{"+key.toString()+"}",data[0][key].toString());
    }
    return(html);
};    

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
/*
function JSONTransform(data){
    var p = new Promise((resolve,reject) => {
        resolve(data=>{return(JSON.parse(data[1]))});
        reject(error=>{
               console.log("Error in Transform");
                return(error)})
    });           
    return(p);
}
*/
function AllinOne(data){
    var jdata =  JSON.parse(data);
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
    this.res.send(dataSet);
}
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
    console.log(html);
    return(html);
}