var workerproxy = require('workerproxy');

var lame = require('./libmp3lame');

// Credit for the wrapping below goes to Andreas Krennmair's work on libmp3lame-js.
// https://github.com/akrennmair/libmp3lame-js
var BUFFER_SIZE = 8192;

function transferMemory(pointer, size, callback) {
  var result = new Uint8Array(size);
  result.set(lame.HEAPU8.subarray(pointer, pointer + size));
  // Transfer the buffer back to main thread.
  callback.disableAuto();
  callback.transfer([result.buffer], null, result.buffer);
}

workerproxy({
  getVersion: lame.cwrap('get_lame_version', 'string'),

  init: lame.cwrap('lame_init', 'number'),
  initParams: lame.cwrap('lame_init_params', 'number', ['number']),
  close: lame.cwrap('lame_close', 'number', ['number']),

  getMode: lame.cwrap('lame_get_mode', 'number', ['number']),
  setMode: lame.cwrap('lame_set_mode', 'number', ['number', 'number']),

  getNumSamples: lame.cwrap('lame_get_num_samples', 'number', ['number']),
  setNumSamples: lame.cwrap('lame_set_num_samples', 'number', ['number', 'number']),

  getNumChannels: lame.cwrap('lame_get_num_channels', 'number', ['number']),
  setNumChannels: lame.cwrap('lame_set_num_channels', 'number', ['number', 'number']),

  getInSampleRate: lame.cwrap('lame_get_in_samplerate', 'number', ['number']),
  setInSampleRate: lame.cwrap('lame_set_in_samplerate', 'number', ['number', 'number']),

  getOutSampleRate: lame.cwrap('lame_get_out_samplerate', 'number', ['number']),
  setOutSampleRate: lame.cwrap('lame_set_out_samplerate', 'number', ['number', 'number']),

  getBitrate: lame.cwrap('lame_get_brate', 'number', ['number']),
  setBitrate: lame.cwrap('lame_set_brate', 'number', ['number', 'number']),

  getVariableBitrate: lame.cwrap('lame_get_VBR', 'number', ['number']),
  setVariableBitrate: lame.cwrap('lame_set_VBR', 'number', ['number', 'number']),

  getVariableBitrateQuality: lame.cwrap('lame_get_VBR_q', 'number', ['number']),
  setVariableBitrateQuality: lame.cwrap('lame_set_VBR_q', 'number', ['number', 'number']),

  getVariableBitrateMean: lame.cwrap('lame_get_VBR_mean_bitrate_kbps', 'number', ['number']),
  setVariableBitrateMean: lame.cwrap('lame_set_VBR_mean_bitrate_kbps', 'number', ['number', 'number']),

  getVariableBitrateMin: lame.cwrap('lame_get_VBR_min_bitrate_kbps', 'number', ['number']),
  setVariableBitrateMin: lame.cwrap('lame_set_VBR_min_bitrate_kbps', 'number', ['number', 'number']),

  getVariableBitrateMax: lame.cwrap('lame_get_VBR_max_bitrate_kbps', 'number', ['number']),
  setVariableBitrateMax: lame.cwrap('lame_set_VBR_max_bitrate_kbps', 'number', ['number', 'number']),

  encodeBuffer: function (handle, left, right, callback) {
    var ptrOut = lame._malloc(BUFFER_SIZE);
    var ptrLeft = lame._malloc(left.length * 4);
    for (var i = 0; i < left.length; i++) {
      lame.setValue(ptrLeft + (i * 4), left[i], 'float');
    }
    var ptrRight = lame._malloc(right.length * 4);
    for (var i = 0; i < right.length; i++) {
      lame.setValue(ptrRight + (i * 4), right[i], 'float');
    }
    var bytes = lame.ccall('lame_encode_buffer_ieee_float', 'number', ['number', 'number', 'number', 'number', 'number', 'number'], [handle, ptrLeft, ptrRight, left.length, ptrOut, BUFFER_SIZE]);
    lame._free(ptrLeft);
    lame._free(ptrRight);
    if (bytes < 0) {
      lame._free(ptrOut);
      throw new Error('LAME reported error: ' + bytes);
    }
    transferMemory(ptrOut, bytes, callback);
    lame._free(ptrOut);
  },

  encodeFlush: function (handle, callback) {
    var ptrOut = lame._malloc(BUFFER_SIZE);
    var bytes = lame.ccall('lame_encode_flush', 'number', ['number', 'number', 'number'], [handle, ptrOut, BUFFER_SIZE]);
    transferMemory(ptrOut, bytes, callback);
    lame._free(ptrOut);
  }
}, {autoCallback: true, catchErrors: true});
