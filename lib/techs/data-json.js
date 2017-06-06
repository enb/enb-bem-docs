var path = require('path'),
    vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    clearRequire = require('clear-require'),
    asyncRequire = require('enb-async-require');

module.exports = buildFlow.create()
    .name('data-json')
    .target('target', '?.data.json')
    .defineOption('langs', [])
    .useSourceFilename('metaFile', '?.meta.json')
    .builder(function (metaFile) {
        var node = this.node,
            langs = this._langs,
            nodeDir = node.getDir(),
            name = path.basename(nodeDir),
            dataByLangs = {};

        clearRequire(metaFile);

        return asyncRequire(metaFile)
            .then(function (meta) {
                if (langs && langs.length) {
                    return vow.all(langs.map(function (lang) {
                        var docBemjsonFilename = node.resolvePath(
                                node.unmaskTargetName('?.' + lang + '.doc.bemjson.js')
                            ),
                            docbemjsonTarget = path.relative(nodeDir, docBemjsonFilename),
                            data = {
                                name: name,
                                examples: meta.examples.filter(function (example) {
                                    var sourcePath = example && example.sourcePath;

                                    if (!sourcePath) { return true; }

                                    var splitedPath = sourcePath.split('.'),
                                        exampleLang = splitedPath[splitedPath.length - 2];

                                    return lang === exampleLang;
                                })
                            };

                        dataByLangs[lang] = data;

                        return node.requireSources([docbemjsonTarget])
                            .then(function () {
                                return vfs.read(docBemjsonFilename, 'utf-8');
                            })
                            .then(function (source) {
                                data.description = source;
                            });
                    }))
                    .then(function () {
                        return JSON.stringify(dataByLangs);
                    });
                } else {
                    var docBemjsonFilename = meta.docBemjsonFiles[0],
                        docbemjsonTarget = path.relative(nodeDir, docBemjsonFilename),
                        data = {
                            name: name,
                            examples: meta.examples
                        };

                    return node.requireSources([docbemjsonTarget])
                        .then(function () {
                            return vfs.read(docBemjsonFilename, 'utf-8');
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
