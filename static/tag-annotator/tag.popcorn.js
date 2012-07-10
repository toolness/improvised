Popcorn.plugin("tag", function(options, f) {
  return {
    start: function(event, options) {
      options.el.text(options.tag);
    },
    end: function(event, options) {
      options.el.text('');
    }
  };
});

Popcorn.tag = {
  startRecording: function startRecording(recorder, el) {
    recorder.metadata = {log: []};
    el.empty();
  },
  record: function record(recorder, tag, el) {
    var time = (Date.now() - recorder.startTime) / 1000;
    if (recorder.state == "recording") {
      recorder.metadata.log.push({
        time: time,
        tag: tag
      });
      el.text(tag + " @ " + time.toFixed(2) + "s");
    }
  },
  annotate: function annotate(pop, metadata, el) {
    function completeLastEntry(endTime) {
      var entry = lastEntry;
      if (!entry)
        return;
      pop.tag({
        start: entry.start,
        end: endTime,
        tag: entry.tag,
        el: el
      });
      lastEntry = null;
    }
  
    var lastEntry = {
      start: 0,
      tag: ""
    };
    metadata.log.forEach(function(entry) {
      var SYNC_OFFSET = 0.75;
      completeLastEntry(entry.time - SYNC_OFFSET - 0.01);
      lastEntry = {
        start: entry.time - SYNC_OFFSET,
        tag: entry.tag
      };
    });
    completeLastEntry(999999);
  }
};
