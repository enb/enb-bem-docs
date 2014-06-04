var path = require('path');
var rootPath = path.join(__dirname, '..', '..', '..');
var docSets = require(rootPath);

module.exports = function (config) {
    var docs = docSets.create('docs', config);

    config.setLanguages(['en']);

    docs.build({
        destPath: 'desktop.docs',
        levels: getDesktopLevels(config)
    });

    docs.build({
        destPath: 'touch.docs',
        levels: getTouchLevels(config)
    });
};

function getDesktopLevels(config) {
    return [
        'common.blocks',
        'desktop.blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}

function getTouchLevels(config) {
    return [
        'common.blocks',
        'touch.blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
