var path = require('path');
var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var dropRequireCache = require('enb/lib/fs/drop-require-cache');
var asyncRequire = require('enb/lib/fs/async-require');

module.exports = require('enb/lib/build-flow').create()
    .name('data-json')
    .target('target', '?.data.json')
    .defineOption('langs', [])
    .useSourceFilename('metaFile', '?.meta.json')
    .builder(function (metaFile) {
        var node = this.node;
        var langs = this._langs;
        var nodeDir = node.getDir();
        var rootDir = node.getRootDir();
        var name = path.basename(nodeDir);
        var dataByLangs = {};

        dropRequireCache(require, metaFile);

        return asyncRequire(metaFile)
            .then(function (meta) {
                if (langs && langs.length) {
                    return vow.all(langs.map(function (lang) {
                        var dochtmlFilename = node.resolvePath(node.unmaskTargetName('?.' + lang + '.doc.html'));
                        var dochtmlTarget = path.relative(nodeDir, dochtmlFilename);
                        var data = {
                            name: name,
                            examples: meta.examples.map(function (filename) {
                                return {
                                    url: path.relative(rootDir, filename)
                                };
                            })
                        };

                        dataByLangs[lang] = data;

                        return node.requireSources([dochtmlTarget])
                            .then(function () {
                                return vfs.read(dochtmlFilename, 'utf-8');
                            })
                            .then(function (source) {
                                data.description = source;
                            });
                    }))
                    .then(function () {
                        return JSON.stringify(dataByLangs);
                    });
                } else {
                    var dochtmlFilename = meta.dochtmlFiles[0];
                    var dochtmlTarget = path.relative(nodeDir, dochtmlFilename);
                    var data = {
                        name: name,
                        examples: meta.examples.map(function (filename) {
                            return {
                                url: path.relative(rootDir, filename)
                            };
                        })
                    };

                    return node.requireSources([dochtmlTarget])
                        .then(function () {
                            return vfs.read(dochtmlFilename, 'utf-8');
                        })
                        .then(function (source) {
                            data.description = source;
                        })
                        .then(function () {
                            return JSON.stringify(data);
                        });
                }
            });
    })
    .createTech();
