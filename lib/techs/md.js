var enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('md')
    .target('target', '?.md')
    .useFileList('md')
    .justJoinFiles()
    .createTech();
