var Dz = (function() {
  var Dz = {
    titlePrefix: "",
    view: null,
    idx: 0,
    step: 0,
    iframe: null,
    recorder: null
  };

  Dz.init = function(iframe, url, cb) {
    this.iframe = iframe;
    this.iframe.setAttribute("src", url);
    this.iframe.onload = function() {
      Dz.view = this.contentWindow;
      Dz.postMsg(Dz.view, "REGISTER");
      if (cb) cb();
    };
  };
  
  Dz.startRecording = function(recorder) {
    this.recorder = recorder;
    recorder.metadata = {
      type: "dzslides",
      log: []
    };
  };
  
  Dz.annotate = function(pop, metadata) {
    function completeLastEntry(endTime) {
      var entry = lastEntry;
      if (!entry)
        return;
      pop.dz({
        start: entry.start,
        end: endTime,
        cmd: entry.cmd
      });
      lastEntry = null;
    }
  
    var lastEntry = {
      start: 0,
      cmd: "SET_CURSOR 1.0"
    };
    if (metadata.type != "dzslides")
      return;
    metadata.log.forEach(function(entry) {
      var SYNC_OFFSET = 0.75;
      completeLastEntry(entry.time - SYNC_OFFSET - 0.01);
      lastEntry = {
        start: entry.time - SYNC_OFFSET,
        cmd: entry.cmd
      };
    });
    completeLastEntry(999999);
  };
  
  Dz.postMsg = function(aWin, aMsg) { // [arg0, [arg1...]]
    aMsg = [aMsg];
    for (var i = 2; i < arguments.length; i++)
      aMsg.push(encodeURIComponent(arguments[i]));
    aWin.postMessage(aMsg.join(" "), "*");
  };

  Dz.onMessage = function(aEvent) {
    if (aEvent.source === this.view) {
      var argv = aEvent.data.split(" "), argc = argv.length;
      argv.forEach(function(e, i, a) { a[i] = decodeURIComponent(e) });
      if (argv[0] === "CURSOR" && this.recorder &&
          this.recorder.state == "recording") {
        this.recorder.metadata.log.push({
          time: (Date.now() - this.recorder.startTime) / 1000,
          cmd: "SET_CURSOR " + encodeURIComponent(argv[1])
        });
      }
      if (argv[0] === "REGISTERED" && argc === 3) {
        document.title = this.titlePrefix + argv[1];
      }
    }
  };
  
  window.addEventListener("message", function(event) {
    Dz.onMessage(event);
  }, false);

  Popcorn.plugin("dz", function(options, f) {
    return {
      start: function(event, options) {
        Dz.view.postMessage(options.cmd, "*");
      },
      end: function(event, options) {
      }
    };
  });

  return Dz;
})();
