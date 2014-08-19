var marked = require('../marked');

module.exports = require('enb/lib/build-flow').create()
    .name('html-from-md')
    .target('target', '?.html')
    .useSourceText('source', '?.md')
    .builder(function (source) {
        return marked(source);
    })
    .createTech();
