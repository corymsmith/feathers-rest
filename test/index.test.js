import assert from 'assert';
import request from 'request';
import feathers from 'feathers';
import bodyParser from 'body-parser';
import rest from '../src';
import { Service as todoService, verify } from 'feathers-commons/lib/test-fixture';

describe('REST provider', function () {
  describe('CRUD', function () {
    let server, app;

    before(function () {
      app = feathers().configure(rest(rest.formatter))
        .use(bodyParser.json())
        .use('codes', {
          get(id, params, callback) {
            callback();
          },

          create(data, params, callback) {
            callback(null, data);
          }
        })
        .use('todo', todoService);

      server = app.listen(4777, () => app.use('tasks', todoService));
    });

    after(done => server.close(done));

    describe('Services', () => {
      it('sets the hook object in res.hook', done => {
        app.use('/hook', {
          get(id, params, callback){
            callback(null, { description: `You have to do ${id}` });
          }
        }, function(req, res, next) {
          res.data.hook = res.hook;
          next();
        });

        request('http://localhost:4777/hook/dishes', (error, response, body) => {
          const hook = JSON.parse(body).hook;
          assert.deepEqual(hook, {
            id:'dishes',
            params: {
              query: {},
              provider: 'rest'
            },
            method: 'get',
            type: 'after'
          });
          done();
        });
      });

      it('GET .find', done => {
        request('http://localhost:4777/todo', (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.find(JSON.parse(body));
          done(error);
        });
      });

      it('GET .get', done => {
        request('http://localhost:4777/todo/dishes', (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.get('dishes', JSON.parse(body));
          done(error);
        });
      });

      it('POST .create', done => {
        let original = {
          description: 'POST .create'
        };

        request({
          url: 'http://localhost:4777/todo',
          method: 'post',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 201, 'Got CREATED status code');
          verify.create(original, JSON.parse(body));

          done(error);
        });
      });

      it('PUT .update', done => {
        let original = {
          description: 'PUT .update'
        };

        request({
          url: 'http://localhost:4777/todo/544',
          method: 'put',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.update(544, original, JSON.parse(body));

          done(error);
        });
      });

      it('PUT .update many', done => {
        let original = {
          description: 'PUT .update',
          many: true
        };

        request({
          url: 'http://localhost:4777/todo',
          method: 'put',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          let data = JSON.parse(body);
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.update(null, original, data);

          done(error);
        });
      });

      it('PATCH .patch', done => {
        let original = {
          description: 'PATCH .patch'
        };

        request({
          url: 'http://localhost:4777/todo/544',
          method: 'patch',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.patch(544, original, JSON.parse(body));

          done(error);
        });
      });

      it('PATCH .patch many', done => {
        let original = {
          description: 'PATCH .patch',
          many: true
        };

        request({
          url: 'http://localhost:4777/todo',
          method: 'patch',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.patch(null, original, JSON.parse(body));

          done(error);
        });
      });

      it('DELETE .remove', done => {
        request({
          url: 'http://localhost:4777/tasks/233',
          method: 'delete'
        }, function (error, response, body) {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.remove(233, JSON.parse(body));

          done(error);
        });
      });

      it('DELETE .remove many', done => {
        request({
          url: 'http://localhost:4777/tasks',
          method: 'delete'
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.remove(null, JSON.parse(body));

          done(error);
        });
      });
    });

    describe('Dynamic Services', () => {
      it('GET .find', done => {
        request('http://localhost:4777/tasks', (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.find(JSON.parse(body));
          done(error);
        });
      });

      it('GET .get', done => {
        request('http://localhost:4777/tasks/dishes', (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.get('dishes', JSON.parse(body));
          done(error);
        });
      });

      it('POST .create', done => {
        let original = {
          description: 'Dynamic POST .create'
        };

        request({
          url: 'http://localhost:4777/tasks',
          method: 'post',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 201, 'Got CREATED status code');
          verify.create(original, JSON.parse(body));

          done(error);
        });
      });

      it('PUT .update', done => {
        let original = {
          description: 'Dynamic PUT .update'
        };

        request({
          url: 'http://localhost:4777/tasks/544',
          method: 'put',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.update(544, original, JSON.parse(body));

          done(error);
        });
      });

      it('PATCH .patch', done => {
        let original = {
          description: 'Dynamic PATCH .patch'
        };

        request({
          url: 'http://localhost:4777/tasks/544',
          method: 'patch',
          body: JSON.stringify(original),
          headers: {
            'Content-Type': 'application/json'
          }
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.patch(544, original, JSON.parse(body));

          done(error);
        });
      });

      it('DELETE .remove', done => {
        request({
          url: 'http://localhost:4777/tasks/233',
          method: 'delete'
        }, (error, response, body) => {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          verify.remove(233, JSON.parse(body));

          done(error);
        });
      });
    });
  });

  describe('HTTP status codes', () => {
    let app;
    let server;

    before(function() {
      app = feathers().configure(rest(rest.formatter))
        .use('todo', {
          get(id, params, callback) {
            callback(null, { description: `You have to do ${id}` });
          },

          find(params, callback) {
            callback();
          }
        });

      /* jshint ignore:start */
      // Error handler
      app.use(function (error, req, res, next) {
        assert.equal(error.message, 'Method `create` is not supported by this endpoint.');
        res.json({ message: error.message });
      });
      /* jshint ignore:end */

      server = app.listen(4780);
    });

    after(done => server.close(done));

    it('throws a 405 for undefined service methods (#99)', done => {
      request('http://localhost:4780/todo/dishes', (error, response, body) => {
        assert.ok(response.statusCode === 200, 'Got OK status code for .get');
        assert.deepEqual(JSON.parse(body), { description: 'You have to do dishes' }, 'Got expected object');
        request({
          method: 'post',
          url: 'http://localhost:4780/todo'
        }, (error, response, body) => {
          assert.ok(response.statusCode === 405, 'Got 405 for .create');
          assert.deepEqual(JSON.parse(body), { message: 'Method `create` is not supported by this endpoint.' }, 'Error serialized as expected');
          done();
        });
      });
    });

    it('throws a 404 for undefined route', done => {
      request('http://localhost:4780/todo/foo/bar', (error, response) => {
        assert.ok(response.statusCode === 404, 'Got Not Found code');

        done(error);
      });
    });

    it('empty response sets 204 status codes', done => {
      request('http://localhost:4780/todo', (error, response) => {
        assert.ok(response.statusCode === 204, 'Got empty status code');

        done(error);
      });
    });
  });

  it('sets service parameters and provider type', done => {
    let service = {
      get(id, params, callback) {
        callback(null, params);
      }
    };

    let server = feathers().configure(rest(rest.formatter))
      .use(function (req, res, next) {
        assert.ok(req.feathers, 'Feathers object initialized');
        req.feathers.test = 'Happy';
        next();
      })
      .use('service', service)
      .listen(4778);

    request('http://localhost:4778/service/bla?some=param&another=thing',
      (error, response, body) => {
        let expected = {
          test: 'Happy',
          provider: 'rest',
          query: {
            some: 'param',
            another: 'thing'
          }
        };

        assert.ok(response.statusCode === 200, 'Got OK status code');
        assert.deepEqual(JSON.parse(body), expected, 'Got params object back');
        server.close(done);
      });
  });

  it('lets you set the handler manually', done => {
    let app = feathers();

    app.configure(rest(function(req, res) {
        res.format({
          'text/plain': function() {
            res.end(`The todo is: ${res.data.description}`);
          }
        });
      }))
      .use('/todo', {
        get(id, params, callback) {
          callback(null, { description: `You have to do ${id}` });
        }
      });

    let server = app.listen(4776);
    request('http://localhost:4776/todo/dishes', (error, response, body) => {
      assert.equal(body, 'The todo is: You have to do dishes');
      server.close(done);
    });
  });

  it('Lets you configure your own middleware before the handler (#40)', done => {
    let data = { description: 'Do dishes!', id: 'dishes' };
    let app = feathers();

    app.use(function defaultContentTypeMiddleware (req, res, next) {
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      next();
    })
    .configure(rest(rest.formatter))
    .use(bodyParser.json())
    .use('/todo', {
      create(data, params, callback) {
        callback(null, data);
      }
    });

    let server = app.listen(4775);
    request({
      method: 'POST',
      url: 'http://localhost:4775/todo',
      body: JSON.stringify(data)
    }, (error, response, body) => {
      assert.deepEqual(JSON.parse(body), data);
      server.close(done);
    });
  });
});
