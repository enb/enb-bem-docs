var builder = require('./builder');
var configurator = require('./node-configurator');

module.exports = function (maker) {
    return {
        build: function (options) {
            var config = maker._config;
            var langs = config.getLanguages();

            options || (options = {});
            options.suffixes || (options.suffixes = ['md', 'wiki']);

            if (langs) {
                options.suffixes = buildI18NSuffixes(options.suffixes, langs);
                configurator.configure(config, options);
            }

            maker._pseudoLevels.push({
                resolve: builder(options),
                destPath: options.destPath,
                levels: options.levels
            });

            return maker._deferred.promise();
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
