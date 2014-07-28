var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var docSets = require(rootPath);

module.exports = function (config) {
    var docs = docSets.create('docs', config);

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
