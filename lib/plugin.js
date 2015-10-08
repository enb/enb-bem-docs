var path = require('path'),
    naming = require('bem-naming'),
    vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    scanner = require('enb-bem-pseudo-levels/lib/level-scanner'),
    configurator = require('./node-configurator'),
    deps = require('enb-bem-techs/lib/deps/deps'),
    MagicConfig = require('enb-magic-factory/lib/magic-config');

function deprecateOption(option, replacement) {
    console.warn('WARNING!');
    console.warn('Option `%s` is deprecated.', option);
    console.warn('Use `%s` option instead.', replacement);
}

module.exports = function (helper, factory, exampleTaskNames) {
    exampleTaskNames = [].concat(exampleTaskNames || []);

    return {
        configure: function (options) {
            options || (options = {});
            options.exampleSets || (options.exampleSets = []);
            options.docSuffixes || (options.docSuffixes = ['md', 'wiki']);
            options.docI18NSuffixes = options.langs ? buildI18NSuffixes(options.docSuffixes, options.langs) : [];

            if (options.jsdoc !== false) {
                options.jsSuffixes && deprecateOption('jsSuffixes', 'jsdoc.suffixes');
                options.jsdocParser && deprecateOption('jsdocParser', 'jsdoc.parser');

                options.jsdoc || (options.jsdoc = {});

                options.jsdoc.suffixes || (options.jsdoc.suffixes = (options.jsSuffixes || ['js']));
                options.jsdoc.parser || (options.jsdoc.parser = (options.jsdocParser || 'jsd'));
            }

            options._examples = [];

            exampleTaskNames.forEach(function (taskName) {
                this._dependOnExamples(taskName, options);
            }, this);

            this._buildSet(options);
            this._configureNodes(options);
        },

        _buildSet: function (options) {
            var root = helper.getRootPath(),
                dstpath = path.resolve(root, options.destPath),
                levels = options.levels.map(function (levelPath) {
                    var level = (typeof levelPath === 'string') ? { path: levelPath } : levelPath;

                    level.path = path.resolve(root, level.path);

                    return level;
                });

            helper.prebuild(function (magic) {
                return scanner.scan(levels)
                    .then(function (files) {
                        var nodes = {},
                            nodeDeps = {};

                        files.forEach(function (file) {
                            var ext = path.extname(file.name);

                            if (options.docSuffixes.indexOf(file.suffix) !== -1 ||
                                options.docI18NSuffixes.indexOf(file.suffix) !== -1 ||
                                ext === '.js'
                            ) {
                                var bemname = file.name.split('.')[0],
                                    notation = naming.parse(bemname),
                                    block = notation.block,
                                    dep = { block: block },
                                    node = path.join(options.destPath, notation.block);

                                notation.elem && (dep.elem = notation.elem);

                                if (notation.modName) {
                                    dep.mod = notation.modName;
                                    dep.val = notation.modVal;
                                }

                                if (magic.isRequiredNode(node)) {
                                    var sourceDeps = nodeDeps[node] || [];

                                    sourceDeps.push(dep);
                                    nodeDeps[node] = sourceDeps;
                                    nodes[node] = true;

                                    magic.registerNode(node);
                                }
                            }
                        });

                        return vow.all(Object.keys(nodes).map(function (node) {
                            var sourceDeps = nodeDeps[node],
                                block = sourceDeps[0].block,
                                dirname = path.join(dstpath, block),
                                bemdeclFilename = path.join(dirname, block + '.bemdecl.js'),
                                bemdeclSource;

                            bemdeclSource = 'exports.blocks = ' + JSON.stringify(deps.toBemdecl(sourceDeps)) + ';';

                            return vfs.makeDir(dirname)
                                .then(function () {
                                    return vfs.write(bemdeclFilename, bemdeclSource, 'utf-8');
                                });
                        }));
                    });
            });
        },

        _configureNodes: function (options) {
            var exampleSets = options.exampleSets;

            exampleTaskNames.forEach(function (taskName) {
                var exampleChannel = factory.getEventChannel(taskName);

                if (exampleSets && exampleChannel) {
                    exampleChannel.on('examples', takeExamples);

                    exampleChannel.on('inline-examples', takeExamples);
                }
            });

            helper.configure(function (projectConfig) {
                configurator.configure(projectConfig, options);
            });

            function takeExamples(scope, items) {
                if (exampleSets.indexOf(scope) !== -1) {
                    options._examples = options._examples.concat(items);
                }
            }
        },

        _dependOnExamples: function (exampleTaskName, options) {
            helper.prebuild(function (magic) {
                var requiredTargets = magic.getRequiredTargets(),
                    exampleHelper = factory.getHelper(exampleTaskName),
                    hasExampleSets = false,
                    hasDocSet = false,
                    runInMagicTask = factory.getMetaTaskState() === 'running';

                requiredTargets && requiredTargets.forEach(function (target) {
                    options.exampleSets.forEach(function (exampleSet) {
                        (target.indexOf(exampleSet) !== -1) && (hasExampleSets = true);
                    });
                    (target.indexOf(options.destPath) !== -1) && (hasDocSet = true);
                });

                // Запускаем предсборку примеров, если таск сборки примеров не был запущен пользователем явно
                // или через мета-таск с аргументами, переданными в `options.exampleSets`.
                if ((!runInMagicTask || (runInMagicTask && hasDocSet && !hasExampleSets)) &&
                    options.exampleSets &&
                    options.exampleSets.length
                ) {
                    var projectConfig = helper._projectConfig,
                        exampleTask = projectConfig && projectConfig._tasks[exampleTaskName],
                        magicConfig = new MagicConfig(options.exampleSets),
                        logger;

                    exampleTask._makePlatform || (exampleTask.setMakePlatform(helper._taskConfig._makePlatform));
                    logger = exampleTask && exampleTask._logger;

                    return vow.all(exampleHelper._prebuilds.map(function (callback) {
                        return callback.apply(exampleHelper, [magicConfig, logger]);
                    }));
                // Ожидаем предсборки примеров
                } else {
                    var channel = exampleHelper.getEventChannel(),
                        defer = vow.defer();

                    channel.on('prebuild', function () {
                        defer.resolve();
                    });

                    return defer.promise();
                }
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
