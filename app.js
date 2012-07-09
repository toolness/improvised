var express = require('express'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    app = express.createServer();

var STATIC_DIR = __dirname + '/static',
    FFMPEG_VORBIS = 'ffmpeg',
    FFMPEG_MP3 = '/Applications/ffmpegX.app/Contents/Resources/ffmpeg';

app.post('/audio', function(req, res) {
  var name = req.get('name', 'UNKNOWN'),
      basefilename = STATIC_DIR + '/outfile',
      wavfilename = basefilename + '.wav',
      outfile = fs.createWriteStream(wavfilename);

  console.log("LENGTH", req.header('content-length'));
  req.pipe(outfile);
  req.on('data', function(chunk) {
    console.log("DATA", chunk.length);
  });
  outfile.on('close', function() {
    console.log("OUTFILE CLOSED, converting to ogggg.");
    var baseArgs = ['-i', wavfilename, '-y'];
    var mp3 = spawn(FFMPEG_MP3, baseArgs.concat([
      '-acodec', 'mp3',
      '-ab', '64k',
      basefilename + '.mp3'
    ]));
    var vorbis = spawn(FFMPEG_VORBIS, baseArgs.concat([
      '-acodec', 'libvorbis',
      '-ac', '2',
      basefilename + '.ogg'
    ]));
    mp3.on('exit', function(code) {
      console.log('mp3 exited with code', code);
    });
    vorbis.on('exit', function(code) {
      console.log('vorbis exited with code', code);
    });
    console.log('ok');
  });
  res.send("THANKS YO");
});

app.use(express.static(STATIC_DIR))

module.exports = app;

if (!module.parent) {
  console.log("listening on 3000");
  app.listen(3000);
}
