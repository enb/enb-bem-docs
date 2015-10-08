var marked = require('../marked'),
    enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('html-from-md')
    .target('target', '?.html')
    .useSourceText('source', '?.md')
    .builder(function (source) {
        return marked(source);
    })
    .createTech();
