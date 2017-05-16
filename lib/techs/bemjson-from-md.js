var convert = require('../md-2-bemjson'),
    enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('bemjson-from-md')
    .target('target', '?.bemjson.js')
    .useSourceText('source', '?.md')
    .builder(function (source) {
        return convert(source);
    })
    .createTech();
