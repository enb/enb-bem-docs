var jsdtmd = require('jsdtmd');
var dropRequireCache = require('enb/lib/fs/drop-require-cache');
var asyncRequire = require('enb/lib/fs/async-require');

module.exports = require('enb/lib/build-flow').create()
    .name('jsdoc-to-md')
    .target('target', '?.jsdoc.md')
    .useSourceFilename('source', '?.jsdoc.json')
    .builder(function (jsdocFilename) {
        dropRequireCache(require, jsdocFilename);

        return asyncRequire(jsdocFilename).then(function (jsdoc) {
            return jsdtmd(jsdoc);
        });
    })
    .createTech();
