var path = require('path');
var builder = require('./builder');
var configurator = require('./node-configurator');
var pseudo = require('enb-bem-pseudo-levels');

module.exports = function (taskConfigurator) {
    return {
        configure: function (options) {
            var config = taskConfigurator.getConfig();

            options || (options = {});
            options.langs = options.langs || config.getLanguages();
            options.docSuffixes || (options.docSuffixes = ['md', 'wiki']);
            options.docI18NSuffixes = options.langs ?
                buildI18NSuffixes(options.docSuffixes, options.langs) : [];

            var root = config._rootPath;
            var dstpath = path.resolve(root, options.destPath);
            var resolve = builder(options);

            configurator.configure(config, options);

            taskConfigurator.prebuild(function (buildConfig) {
                var dstargs = buildConfig._args.map(function (arg) {
                    return path.resolve(root, arg);
                });

                return pseudo(options.levels)
                    .addBuilder(dstpath, resolve)
                    .build(dstargs)
                    .then(function (filenames) {
                        var targets = filenames.map(function (filename) {
                            return path.relative(root, filename);
                        });

                        targets.forEach(function (target) {
                            var basename = path.basename(target);

                            if (basename !== '.blocks') {
                                buildConfig.addNode(path.dirname(target));
                            }
                        });
                    });
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
