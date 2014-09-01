var path = require('path'),
    rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    config.includeConfig(rootPath);

    var docs = config.module('enb-bem-docs').createConfigurator('docs');

    docs.configure({
        destPath: 'set.docs',
        levels: ['blocks'],
        jsdoc: { suffixes: ['vanilla.js', 'browser.js', 'js'] }
    });
};
