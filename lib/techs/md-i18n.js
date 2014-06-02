module.exports = require('enb/lib/build-flow').create()
    .name('md-i18n')
    .target('target', '?.{lang}.md')
    .defineRequiredOption('lang')
    .useFileList('{lang}.md')
    .justJoinFiles()
    .createTech();
