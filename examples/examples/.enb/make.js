var path = require('path'),
    rootPath = path.join(__dirname, '..', '..', '..');

module.exports = function (config) {
    config.includeConfig(rootPath);
    config.includeConfig('enb-bem-examples');

    var examples = config.module('enb-bem-examples').createConfigurator('examples'),
        docs = config.module('enb-bem-docs').createConfigurator('docs', 'examples');

    examples.configure({
        destPath: 'set.examples',
        levels: getLevels(config),
        inlineBemjson: true
    });

    docs.configure({
        destPath: 'set.docs',
        levels: getLevels(config),
        exampleSets: ['set.examples']
    });
};

function getLevels(config) {
    return [
        'blocks'
    ].map(function (level) {
        return config.resolvePath(level);
    });
}
