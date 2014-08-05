var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    config.includeConfig(rootPath);

    var docs = config.module('enb-bem-docs').createConfigurator('docs');

    docs.configure({
        destPath: 'docs',
        levels: getLevels(config),
        langs: ['en', 'ru']
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
