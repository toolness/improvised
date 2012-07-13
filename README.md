This is an experimental framework for recording audio that is synchronized
to actions on a web page, which can be exported as a web-native
presentation.

The framework is intended to decouple audio recording from the generation of
synchronization metadata. The pilot "plug-in" uses [DZSlides][], with an aim
to make it easy for anyone to record audio for their DZSlides-based
presentation and output the synchronized "movie" as a [popcorn][]-powered
presentation. However, similar plug-ins could be written to support the
recording of code editing, painting, or anything else web-based.

The recorder uses [wami-recorder][] to record audio via Flash, and delegates
the generation of JSON synchronization metadata to the external plug-in.
Playback doesn't require Flash and is fully web-native; eventually,
even recording will be fully web-native, once browsers start supporting
[WebRTC][].

Currently the project is highly experimental and completely undocumented,
however, so play with this at your own risk. :)

  [DZSlides]: http://paulrouget.com/dzslides/
  [popcorn]: http://popcornjs.org/
  [wami-recorder]: http://code.google.com/p/wami-recorder/
  [WebRTC]: http://www.webrtc.org/
