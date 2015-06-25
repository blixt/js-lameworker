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


Building
--------

Make sure you have Emscripten set up on your system, then run `make`.
