var utils = require('./utils');

/**
 * Representation of an HTTP request.
 * 
 * @param {Object} options {url, method, headers, body, retries}
 */
var Request = function(url, options){
  this.url = url;
  this.method = options.method || 'GET';
  this.headers = options.headers || {};
  this.body = options.body;
  this.retries = options.retries || 0;
};

Request.prototype.prepare = function(){
  
  if(this.headers){
    // Copy the headers
    this.headers = JSON.parse(JSON.stringify(this.headers));
  }
  
  var platformRequest = this.url.indexOf('/platform/') !== -1;
  
  // Set the Accept header if it's missing on /platform URLs
  if(!this.headers['Accept'] && platformRequest){
    this.headers['Accept'] = 'application/x-fs-v1+json';
  }
  
  // Set the Authorization header if we have an access token
  if(!this.headers['Authorization'] && this.accessToken){
    this.headers['Authorization'] = 'Bearer ' + this.accessToken;
  }
  
  // Disable automatic redirects
  if(!this.headers['X-Expect-Override'] && platformRequest){
    this.headers['X-Expect-Override'] = '200-ok';
  }
  
  // Process the body
  //
  // Allow for a string or object. If an object is given then stringify it.
  // Try to guess the appropriate `Content-Type` value if it's missing.
  if(this.body && (this.method === 'POST' || this.method === 'PUT')){
    
    // Try to guess the content type if it's missing
    if(!this.headers['Content-Type'] && platformRequest){
      this.headers['Content-Type'] = 'application/x-fs-v1+json';
    }
    
    // Turn objects into strings
    if(typeof body !== 'string'){
      
      // JSON.stringify() if the content-type is JSON
      if(this.headers['Content-Type'] && this.headers['Content-Type'].indexOf('json') !== -1){
        this.body = JSON.stringify(this.body);
      } 
      
      // URL encode
      else {
        this.body = utils.urlEncode(this.body);
      }
      
    }
  }
  
};

module.exports = Request;