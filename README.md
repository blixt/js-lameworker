LAME worker
===========

Package for running LAME in a Web Worker. LAME makes it easy to encode and decode MP3 files. See [`example.html`](http://blixt.nyc/js-lameworker/example.html) for an example that records audio from the microphone and encodes it as MP3 in real-time, then lets the user download it.


Example
-------

Using this library is very simple. Assuming you have an HTML file with `lame.js` and `lame.worker.js` in the same directory, you can do the following:

```html
<script src="lame.js"></script>
<script>
var lame = lameworker();
lame.getVersion(function (error, version) {
  console.log('Using LAME v' + version);
});
</script>
```

See `dist/example.html` for a full example.


### Using with Browserify etc.

If you're using a toolchain that simulates a CommonJS environment, you can import this package instead of using the global from `dist/lame.js`:

```javascript
var lameworker = require('lameworker');

// Note that you still need to refer to a stand-alone worker file.
var lame = lameworker('/static/lame.worker.js');

lame.getVersion(function (error, version) {
  console.log('Using LAME v' + version);
});
```

You can find the stand-alone worker file as `dist/lame.worker.js` in this package.


### Encoding microphone data in real time

Sending microphone data to LAME is pretty straightforward. (To see this in action, check out [the example page](http://blixt.nyc/js-lameworker/example.html).)

#### Initializing LAME

```javascript
// init gets a global handle to refer to a single encoding session.
lame.init(function (error, handle) {
  // Set up LAME parameters.
  // These are all asynchronous but order is guaranteed.
  lame.setMode(handle, lameworker.MONO);
  lame.setNumChannels(handle, 1);
  lame.setInSampleRate(handle, 44100);
  lame.setOutSampleRate(handle, 44100);
  lame.setBitrate(handle, 128);
  // initParams prepares the session for encoding with above parameters.
  lame.initParams(handle);
});
```

#### Encoding the microphone data

```javascript
// Keep a list of ArrayBuffer instances coming in from LAME.
var buffers = [];
// Let's pretend we're listening for audio data from a Web Audio API script processor.
processor.onaudioprocess = function (event) {
  // Send microphone data to LAME for MP3 encoding while recording.
  var array = event.inputBuffer.getChannelData(0);
  lame.encodeBuffer(handle, array, array, function (error, buffer) {
    // buffer is an ArrayBuffer containing MP3 data.
    buffers.push(buffer);
  });
};
```

#### Closing the LAME session and getting an MP3 blob

```javascript
// When done, get the remaining data and close the LAME session.
lame.encodeFlush(handle, function (error, buffer) {
  buffers.push(buffer);
  // The Blob interface automatically concatenates all the buffers into a single MP3 binary.
  var blob = new Blob(buffers, {type: 'audio/mp3'});
  // Do something with blob here...
});
// Clean up the LAME session.
lame.close(handle);
```


TODO
----

There are some obvious improvements to be done still:

1. Keep buffers within the Web Worker and only send back a `Blob` instance once the encoding is complete
2. Simpler API with a helper on the main thread side to make encoding MP3 just a couple of API calls
3. When the main thread sends data to the Web Worker, transfer the buffer instead of cloning it
4. More? Please add issues to this repository!


Building
--------

Make sure you have Emscripten set up on your system, then run `make`.

*Note*: For the worker file to work properly, you may need Emscripten including this pull request: https://github.com/kripken/emscripten/pull/3577
