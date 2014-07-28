module.exports = require('enb/lib/build-flow').create()
    .name('md')
    .target('target', '?.md')
    .useFileList('md')
    .justJoinFiles()
    .createTech();
