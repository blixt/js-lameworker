var workerproxy = require('workerproxy');

function lameworker(opt_workerPath) {
  if (!opt_workerPath) opt_workerPath = 'lame.worker.js';
  var worker = new Worker(opt_workerPath);
  return workerproxy(worker, {functionNames: [
    'getVersion',
    'init',
    'initParams',
    'close',
    'getMode',
    'setMode',
    'getNumSamples',
    'setNumSamples',
    'getNumChannels',
    'setNumChannels',
    'getInSampleRate',
    'setInSampleRate',
    'getOutSampleRate',
    'setOutSampleRate',
    'getBitrate',
    'setBitrate',
    'getVariableBitrate',
    'setVariableBitrate',
    'getVariableBitrateQuality',
    'setVariableBitrateQuality',
    'getVariableBitrateMean',
    'setVariableBitrateMean',
    'getVariableBitrateMin',
    'setVariableBitrateMin',
    'getVariableBitrateMax',
    'setVariableBitrateMax',
    'encodeBuffer',
    'encodeFlush'
  ]});
}

lameworker.BUFFER_SIZE = 8192;
lameworker.STEREO = 0;
lameworker.JOINT_STEREO = 1;
lameworker.MONO = 3;

module.exports = lameworker;
