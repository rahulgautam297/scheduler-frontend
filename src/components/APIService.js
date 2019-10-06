class ApiService {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  get(url, onResponse, onError) {
    return fetch(url, {
      method: 'GET',
      headers: this.headers,
      
    }).then(function (response) {
      response.json().then(function(data) {
        onResponse(data);
        return;
      });
    }).catch(function(error) {
        onError({
          message: 'Looks like something went wrong. Please try again.'
        });
      return;
    });
  }



  post(url, params, onResponse, onError) {
    return fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params)
    }).then(function (response) {
      response.json().then(function(data) {
        onResponse(data);
        return;
      });
    }).catch(function(error) {
        onError({
          message: 'Looks like something went wrong. Please try again.'
        });
      return;
    });
  }

  put(url, params, onResponse, onError) {
     fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(params)
    }).then(function (response) {
      response.json().then(function(data) {
        onResponse(data);
        return;
      });
    }).catch(function(error) {
        onError({
          message: 'Looks like something went wrong. Please try again.'
        });
      return;
    });
  }
}

export default ApiService;
