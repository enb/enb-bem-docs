var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var docsSets = require(rootPath);

module.exports = function (config) {
    var docs = docsSets.create('docs', config);

    config.setLanguages(['en', 'ru']);

    docs.build({
        destPath: 'docs',
        levels: getLevels(config)
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
