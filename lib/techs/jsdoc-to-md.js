var jsdtmd = require('jsdtmd'),
    enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    clearRequire = require('clear-require'),
    asyncRequire = require('enb-async-require');

module.exports = buildFlow.create()
    .name('jsdoc-to-md')
    .target('target', '?.jsdoc.md')
    .useSourceFilename('source', '?.jsdoc.json')
    .builder(function (jsdocFilename) {
        clearRequire(jsdocFilename);

        return asyncRequire(jsdocFilename).then(function (jsdoc) {
            return jsdtmd(jsdoc);
        });
    })
    .createTech();
