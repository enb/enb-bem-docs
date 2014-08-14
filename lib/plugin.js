var path = require('path');
var naming = require('bem-naming');
var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var scanner = require('enb-bem-pseudo-levels/lib/level-scanner');
var configurator = require('./node-configurator');
var deps = require('enb-bem/lib/deps/deps');

module.exports = function (helper) {
    return {
        configure: function (options) {
            var config = helper.getProjectConfig();

            options || (options = {});
            options.langs = options.langs || config.getLanguages();
            options.docSuffixes || (options.docSuffixes = ['md', 'wiki']);
            options.docI18NSuffixes = options.langs ?
                buildI18NSuffixes(options.docSuffixes, options.langs) : [];

            var root = config.getRootPath();
            var dstpath = path.resolve(root, options.destPath);
            var levels = options.levels.map(function (level) {
                return (typeof level === 'string') ? { path: level } : level;
            });

            helper.prebuild(function (magic) {
                return scanner.scan(levels)
                    .then(function (files) {
                        var nodes = {};

                        files.forEach(function (file) {
                            var ext = path.extname(file.name);

                            if (options.docSuffixes.indexOf(file.suffix) !== -1 ||
                                options.docI18NSuffixes.indexOf(file.suffix) !== -1 ||
                                ext === '.js'
                            ) {
                                var bemname = file.name.split('.')[0];
                                var block = naming.parse(bemname).block;
                                var node = path.join(options.destPath, block);

                                if (magic.isRequiredNode(node)) {
                                    nodes[node] = true;
                                    magic.registerNode(node);
                                }
                            }
                        });

                        return vow.all(Object.keys(nodes).map(function (node) {
                            var basename = path.basename(node);
                            var dirname = path.join(dstpath, basename);
                            var bemdeclFilename = path.join(dirname, basename + '.bemdecl.js');
                            var notation = naming.parse(basename);
                            var dep = { block: notation.block };
                            var bemdeclSource;

                            notation.elem && (dep.elem = notation.elem);

                            if (notation.modName) {
                                dep.mod = notation.modName;
                                dep.val = notation.modVal;
                            }

                            bemdeclSource = 'exports.blocks = ' + JSON.stringify(deps.toBemdecl([dep])) + ';';

                            return vfs.makeDir(dirname)
                                .then(function () {
                                    return vfs.write(bemdeclFilename, bemdeclSource, 'utf-8');
                                });
                        }));
                    })
                    .then(function () {
                        configurator.configure(config, options);
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
