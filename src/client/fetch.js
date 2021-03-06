import Base from './base';

export default class Service extends Base {
  request(options) {
    let fetchOptions = Object.assign({}, {
      method: options.method,
      headers: {
        'Accept': 'application/json'
      }
    }, options.fetch);

    return new Promise((resolve, reject) => {
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
        fetchOptions.headers['Content-Type'] = 'application/json';
      }

      this.connection(options.url, fetchOptions)
        .then(this.checkStatus)
        .then(this.parseJSON)
        .then(resolve).catch(reject);
    });
  }

  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  parseJSON(response) {
    return response.json();
  }
}
