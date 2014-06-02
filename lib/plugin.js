var builder = require('./builder');
var configurator = require('./node-configurator');

module.exports = function (maker) {
    return {
        build: function (options) {
            var config = maker._config;
            var langs = config.getLanguages();

            options || (options = {});
            options.suffixes || (options.suffixes = ['md', 'wiki']);
            options.suffixes = buildI18NSuffixes(options.suffixes, langs);

            configurator.configure(config, options);

            return maker.build(builder(options), options);
        }
    };
};

function buildI18NSuffixes(suffixes, langs) {
    var res = [];

    suffixes.map(function (suffix) {
        langs.forEach(function (lang) {
            res.push([lang, suffix].join('.'));
        });
    });

    return res;
}
