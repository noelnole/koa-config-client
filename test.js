'use strict'
const configclient  = require('./index')
const request = require('supertest')
var koa       = require('koa');
const assert  = require('assert');


describe('Configuration client',() => {
    it('should throw 404 load the configuration from config server',  function(done) {
        this.timeout(15000);
        var app = new koa();
        app.use(configclient());
        request(app.listen())
          .get('/')
          .expect(404)
          .end(done);
    });
    it('Return the property found',  function() {
        this.timeout(15000);
        var property = configclient.property("security.audience")
        assert.equal(property, "Viajaneando");
    });
    it('Should return undefined because the property is not found', function() {
        this.timeout(15000);
        var property = configclient.property("dont.found")
        assert.deepEqual(property, null);
    });

})
