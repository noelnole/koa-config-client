'use strict'

var appRoot    = require('app-root-path');
var config     = require(appRoot + '/configuration.json');
var rp         = require('request-promise');
var Log        = require('log');
log            = new Log(config.logging.level);


/**
* @fileOverview Middleware client of configuration service.
* This middleware is able to get the properties of a configuration
* service in json format and return each property.
*
* @author Noel Rodriguez
* @version 1.0.0
*
* @example
* var koa = require('koa');
* var configClient = require(koa-config-client);
* var app = new koa();
* app.use(configClient());
* configClient.property("security.audience");
*/
var properties;
module.exports = function(opts) {
  opts = opts || {};
  var middleware = async function load(ctx, next){
    if (properties == null || properties === 'undefined'){
      if (ctx == null || ctx === 'undefined'){
        return ctx.throw(405, 'KOA framework is mandatory');
      }
      await  loadConfiguration(ctx, next);
      return next();
    }
  };
  return middleware;
};


/**
* This method return the property searched
* @param {String} opts options passed as parameter
*/
function getProperty (opts){
  if (opts != null && opts != '' && properties != null && properties != ''){
    var parts = opts.split('.');
    return findProperty(properties,0,parts,parts.length-1);
  }else{
    log.error(err, "Property "+property+" not found");
    return;
  }
}

/**
* Recursive function to search a property in a json
* @param {String} json with properties
* @param {integer} index to get the property inside of the properties array
* @param {property} property array with the properties (serenity.security)
  @param {integer} stop condition to stop the function
*/
var findProperty = function(json,index,property,stop) {
    if (index < stop ) {
      return findProperty(json[property[index]], index+1,property,stop);
    } else {
        try{
          return json[property[index]];
        }catch(err){
          log.error(err, "Property "+property+" not found");
          return;
        }
    }
};

/**
* This method load the configuration with the url of the configuration file. If
* the url is wrong or the service is down the application will throw a 405 * * * error.
* @param {ctx} ctx context koa
*
*/
async function loadConfiguration(ctx){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  var profile = config.configurationservice.profile || 'default';
  var label   = config.configurationservice.label;
  var name    = config.configurationservice.name;
  var url     = config.configurationservice.url;
  var configurationServiceUrl = url+"/config"+ "/"+label+"/"+name+"-"+profile+".json";

  var attempts = config.configurationservice.attempts;

  while(attempts > 0){
    await rp(configurationServiceUrl)
      .then(function (configuration) {
        attempts = 0;
        properties = JSON.parse(configuration);
        return;
      })
      .catch(function (err) {
        sleep(config.configurationservice.delay);
        if (attempts > 1){
          attempts = attempts - 1;
        }else{
          log.error("Either the service is not available or the url is wrong");
          return ctx.throw(405, 'Configuration service is not available');
        }
    });
  }
}

/**
* Sleep function, wait n miliseconds
* @param {integer} miliseconds number of miliseconds to wait
*/
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
module.exports.property   = getProperty;
