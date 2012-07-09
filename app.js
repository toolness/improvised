var express = require('express'),
    fs = require('fs'),
    app = express.createServer();

var STATIC_DIR = __dirname + '/static';

app.post('/audio', function(req, res) {
  var name = req.get('name', 'UNKNOWN'),
      outfile = fs.createWriteStream(STATIC_DIR + '/outfile.wav');

  req.pipe(outfile);
  res.send("THANKS YO");
});

app.use(express.static(STATIC_DIR))

module.exports = app;
