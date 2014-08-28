var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    config.includeConfig(rootPath);

    var docs = config.module('enb-bem-docs').createConfigurator('docs');

    docs.configure({
        destPath: 'set.docs',
        levels: getLevels(config),
        jsSuffixes: ['vanilla.js', 'browser.js', 'js']
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
