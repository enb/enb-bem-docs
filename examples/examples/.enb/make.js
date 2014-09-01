var path = require('path'),
    rootPath = path.join(__dirname, '..', '..', '..'),
    levels = ['blocks'];

module.exports = function (config) {
    config.includeConfig(rootPath);
    config.includeConfig('enb-bem-examples');

    var examples = config.module('enb-bem-examples').createConfigurator('examples'),
        docs = config.module('enb-bem-docs').createConfigurator('docs', 'examples');

    examples.configure({
        destPath: 'set.examples',
        levels: levels,
        inlineBemjson: true
    });

    docs.configure({
        destPath: 'set.docs',
        levels: levels,
        exampleSets: ['set.examples']
    });
};
