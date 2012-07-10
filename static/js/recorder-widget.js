function RecorderWidget(options) {
  var recordState,
      recordStart = 0,
      baseURL = options.baseURL || '',
      wami = options.wami || window.Wami,
      el = $(options.element),
      self = {
        el: el,
        on: function(event, handler) {
          el.bind(event, function(event, arg) {
            handler.call(self, event, arg);
          });
          return self;
        }
      };

  function setRecordState(state) {
    var RECORDING_STATES = "loading idle pre-recording recording uploading";

    if (state == "recording") {
      self.startTime = recordStart = Date.now();
      self.metadata = {};
    } else if (state == "idle") {
      self.startTime = recordStart = 0;
    }
    
    recordState = state;
    self.state = state;
    el.removeClass(RECORDING_STATES).addClass(state);
    el.trigger("state-change");
  }

  function insertAudioElement() {
    var playback = $(".playback", el);
    var cacheBuster = "?bust=" + Date.now();
    playback.empty();
    var audio = document.createElement("audio");
    audio.setAttribute("controls", "controls");
    var source = document.createElement("source");
    source.setAttribute("src", "recording.mp3" + cacheBuster);
    source.setAttribute("type", "audio/mp3");
    audio.appendChild(source);
    source = document.createElement("source");
    source.setAttribute("src", "recording.ogg" + cacheBuster);
    source.setAttribute("type", "audio/ogg");
    audio.appendChild(source);
    playback.append(audio);
  }
  
  setRecordState("loading");
  wami.setup({
    id : $(".wami", el).attr("id"),
    onReady : function() {
      insertAudioElement();
      jQuery.ajax({
        url: baseURL + "/metadata.json",
        dataType: 'json',
        success: function(metadata) {
          self.metadata = metadata;
        },
        error: function() {
          self.metadata = {};
        },
        complete: function() {
          setRecordState("idle");
        }
      });
    }
  });

  window.setInterval(function() {
    var now = Date.now();
    if (recordStart)
      $("time", el).text(((now - recordStart) / 1000).toFixed(2));
  }, 50);

  $(".stop", el).click(function stopRecording() {
    if (recordState == "recording") {
      wami.stopRecording();
      setRecordState("uploading");
    }
  });

  $(".start", el).click(function startRecording() {
    if (recordState != "idle")
      return;
    setRecordState("pre-recording");
    $(".playback", el).empty();
    wami.startRecording(baseURL + "/audio",
      wami.nameCallback(function() {
        setRecordState("recording");
      }),
      wami.nameCallback(function() {
        jQuery.ajax({
          type: 'POST',
          url: baseURL + '/metadata',
          data: JSON.stringify(self.metadata),
          success: function() {
            insertAudioElement();
          },
          error: function() {
            el.trigger("error", "failed to upload metadata");
          },
          complete: function() {
            setRecordState("idle");
          }
        });
      }),
      wami.nameCallback(function(message) {
        el.trigger("error", message);
        setRecordState("idle");
      })
    );
  });
  
  return self;
}
