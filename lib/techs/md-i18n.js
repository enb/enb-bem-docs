var enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('md-i18n')
    .target('target', '?.{lang}.md')
    .defineRequiredOption('lang')
    .useFileList('{lang}.md')
    .justJoinFiles()
    .createTech();
