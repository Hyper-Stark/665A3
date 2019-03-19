
/******************************************************************************************************************
* File:REST.js
* Course: 17655
* Project: Assignment A3
* Copyright: Copyright (c) 2018 Carnegie Mellon University
* Versions:
*   1.0 February 2018 - Initial write of assignment 3 for 2018 architectures course(ajl).
*
* Description: This module provides the restful webservices for the Server.js Node server. This module contains GET,
* and POST services.  
*
* Parameters: 
*   router - this is the URL from the client
*   connection - this is the connection to the database
*   md5 - This is the md5 hashing/parser... included by convention, but not really used 
*
* Internal Methods: 
*   router.get("/"... - returns the system version information
*   router.get("/orders"... - returns a listing of everything in the ws_orderinfo database
*   router.get("/orders/:order_id"... - returns the data associated with order_id
*   router.post("/order?"... - adds the new customer data into the ws_orderinfo database
*
* External Dependencies: mysql
*
******************************************************************************************************************/

var mysql   = require("mysql");     //Database
var CREDFUN = require("./md5");      //md5 function
var credentials = new Set([]);      //credentials collection

function REST_ROUTER(router,connection) {
    var self = this;
    self.handleRoutes(router,connection);
}

// Here is where we define the routes. Essentially a route is a path taken through the code dependent upon the 
// contents of the URL

REST_ROUTER.prototype.handleRoutes= function(router,connection) {

    // GET with no specifier - returns system version information
    // req paramdter is the request object
    // res parameter is the response object

    router.get("/",function(req,res){
        res.json({"Message":"Orders Webservices Server Version 1.0"});
    });
    
    // GET for /orders specifier - returns all orders currently stored in the database
    // req paramdter is the request object
    // res parameter is the response object
  
    router.get("/orders",function(req,res){
        console.log("Getting all database entries..." );
        var query = "SELECT * FROM ??";
        var table = ["orders"];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Success", "Orders" : rows});
            }
        });
    });

    // GET for /orders/order id specifier - returns the order for the provided order ID
    // req paramdter is the request object
    // res parameter is the response object
     
    router.get("/orders/:order_id",function(req,res){
        console.log("Getting order ID: ", req.params.order_id );
        var query = "SELECT * FROM ?? WHERE ??=?";
        var table = ["orders","order_id",req.params.order_id];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "Success", "Users" : rows});
            }
        });
    });

    // POST for /orders?order_date&first_name&last_name&address&phone - adds order
    // req paramdter is the request object - note to get parameters (eg. stuff afer the '?') you must use req.body.param
    // res parameter is the response object 
  
    router.post("/orders",function(req,res){
        //console.log("url:", req.url);
        //console.log("body:", req.body);
        console.log("Adding to orders table ", req.body.order_date,",",req.body.first_name,",",req.body.last_name,",",req.body.address,",",req.body.phone);
        var query = "INSERT INTO ??(??,??,??,??,??) VALUES (?,?,?,?,?)";
        var table = ["orders","order_date","first_name","last_name","address","phone",req.body.order_date,req.body.first_name,req.body.last_name,req.body.address,req.body.phone];
        query = mysql.format(query,table);
        connection.query(query,function(err,rows){
            if(err) {
                res.json({"Error" : true, "Message" : "Error executing MySQL query"});
            } else {
                res.json({"Error" : false, "Message" : "User Added !"});
            }
        });
    });

    router.get("/orders/delete/:order_id",function (req,res) {
        console.log("Getting order ID:" + req.params.order_id);
        var query = "DELETE FROM ?? where ??=?;";
        var table = ['orders','order_id',req.params.order_id];
        query = mysql.format(query,table);
        connection.query(query,function (err,rows) {
            if (err){
                res.json({"Error":true, "Message":"Error executing MySQL query"});
            }else{
                res.json({"Error" : false, "Message" : "Order deleted !"});
            }
        })
    });

    router.post("/orders/signin/",function (req,res) {
        console.log(req.body.username+" is trying to sign in");
        username = req.body.username;
        password = req.body.password;
        var query = "SELECT * FROM ?? where ??=? and ??=?;";
        var table = ["users","user_name",username,"password",password];
        query = mysql.format(query,table);
        connection.query(query, function (err,rows) {
            if (err){
                res.json({"Error":true,"Message":"Error occurred when execute sign in sql: "+err})
            } else if(rows.length > 0){
                var credential = CREDFUN.MD5(username+Date.now());
                credentials.add(credential);
                res.json({"Error":false,"Credential":credential});
           } else {
                res.json({"Error":true,"Credential":""});
            }
        });
    });


    router.post("/orders/signup",function (req,res) {
        console.log("Trying to register a new account");
        username = req.body.username;
        password = req.body.password;
        var query = "SELECT * FROM ?? where ??=?;";
        var table = ['users','user_name',username];
        query = mysql.format(query,table);
        connection.query(query,function (err,rows) {
            if (err){
                res.json({"Error":true,"Message":"Error occurred when execute sign up query sql: "+err})
            }else{
                if (rows.length > 0){
                    res.json({"Error":true,"Message":"This username has been used, please try another"});
                }else{

                    var insert = "INSERT INTO users(??,??) VALUES(?,?)";
                    var args  = ["user_name","password",username,password];
                    insert = mysql.format(insert,args);
                    connection.query(insert,function (err, result) {
                        if (err){
                            res.json({"Error":true,"Message":"Error occurred when execute sign up insert sql: "+ err});
                        }else{
                            if (result.affectedRows > 0){
                                res.json({"Error":false,"Message":"Signed up successfully! "});
                            }else {
                                res.json({"Error":true,"Message":"Failed to sign up! "});
                            }
                        }
                    });
                }
            }
        });
    })
}

// The next line just makes this module available... think of it as a kind package statement in Java

module.exports = REST_ROUTER;