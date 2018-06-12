const superagent = require('superagent');
const Throttle = require('superagent-throttle');

const throttle = new Throttle({
    active: true,
    rate: 1,
    ratePer: 1100 // 1s was failing...this seems good though
});

module.exports = (authorize) => {
  const get = (path, data) => {
    return authorize()
      .then(token => {
        return new Promise((resolve, reject) => {
          superagent
            .get(path)
            .set('Authorization', `Bearer ${token}`)
            .use(throttle.plugin())
            .end((err, res) => {
              if (err) {
                reject(err);
              } else {
                var body = res.body;
                var items = body.items;

                if (items) {
                  data && (items = items.map(item => {
                    Object.keys(data).forEach(chunk => {
                      item[chunk] = data[chunk];
                    });

                    return item;
                  }));

                  resolve(items);
                } else {
                  data && Object.keys(data).forEach(chunk => {
                    body[chunk] = data[chunk];
                  });

                  resolve(res.body);
                }
              }
            });
        });
      });
  };

  const post = (path, data) => {
    return authorize()
      .then(token => {
        return new Promise((resolve, reject) => {
          superagent
            .post(path)
            .send(data)
            .set('Authorization', `Bearer ${token}`)
            .use(throttle.plugin())
            .end((err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res.body);
              }
            });
        });
      });
  };

  const put = (path, data) => {
    return authorize()
      .then(token => {
        return new Promise((resolve, reject) => {
          superagent
            .put(path)
            .send(data)
            .set('Authorization', `Bearer ${token}`)
            .use(throttle.plugin())
            .end((err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res.body);
              }
            });
        });
      });
  };

  return {
    get,
    post,
    put
  }
};
