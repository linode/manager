var path = require('path');
var process = require('process');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');
var mime = require('mime');

var app = express();
var compiler = webpack(config);

app.use('/assets', express.static(__dirname + '/assets'));

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

var port = process.env.MANAGER_PORT || 3000;

app.listen(port, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:' + port);
});
