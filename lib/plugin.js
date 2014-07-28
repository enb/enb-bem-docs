var builder = require('./builder');
var configurator = require('./node-configurator');

module.exports = function (maker) {
    return {
        configure: function (options) {
            var config = maker._config;
            var langs = config.getLanguages();

            options || (options = {});
            options.docSuffixes || (options.docSuffixes = ['md', 'wiki']);
            options.docI18NSuffixes = langs ? buildI18NSuffixes(options.docSuffixes, langs) : [];

            configurator.configure(config, options);

            maker._pseudoLevels.push({
                resolve: builder(options),
                destPath: options.destPath,
                levels: options.levels
            });
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
