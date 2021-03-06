import feathers from 'feathers';
import bodyParser from 'body-parser';
import memory from 'feathers-memory';
import rest from '../../src';

Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});

module.exports = function(configurer) {
  // Create an in-memory CRUD service for our Todos
  var todoService = memory().extend({
    get: function(id, params) {
      if(params.query.error) {
        throw new Error('Something went wrong');
      }

      return this._super(id, params)
        .then(data => Object.assign({ query: params.query }, data));
    }
  });

  var app = feathers()
    .configure(rest())
    // Parse HTTP bodies
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Host the current directory (for index.html)
    .use(feathers.static(__dirname))
    // Host our Todos service on the /todos path
    .use('/todos', todoService);

  if(typeof configurer === 'function') {
    configurer.call(app);
  }

  app.service('todos').create({ text: 'some todo', complete: false }, {}, function() {});

  return app;
};
