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
                        var dochtmlFilename = node.resolvePath(node.unmaskTargetName('?.' + lang + '.doc.html')),
                            dochtmlTarget = path.relative(nodeDir, dochtmlFilename),

                            docBemjsonFilename = node.resolvePath(
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

                        return node.requireSources([docbemjsonTarget, dochtmlTarget])
                            .then(function () {
                                return vow.all([
                                    vfs.read(docBemjsonFilename, 'utf-8'),
                                    vfs.read(dochtmlFilename, 'utf-8')
                                ]);
                            })
                            .spread(function (docBemjsonSource, dochtmlSource) {
                                data.description = dochtmlSource;
                                data.bemjsonDescription = docBemjsonSource;
                            });
                    }))
                    .then(function () {
                        return JSON.stringify(dataByLangs);
                    });
                } else {
                    var dochtmlFilename = meta.dochtmlFiles[0],
                        dochtmlTarget = path.relative(nodeDir, dochtmlFilename),

                        docBemjsonFilename = meta.docBemjsonFiles[0],
                        docbemjsonTarget = path.relative(nodeDir, docBemjsonFilename),

                        data = {
                            name: name,
                            examples: meta.examples
                        };

                    return node.requireSources([docbemjsonTarget, dochtmlTarget])
                        .then(function () {
                            return vow.all([
                                vfs.read(docBemjsonFilename, 'utf-8'),
                                vfs.read(dochtmlFilename, 'utf-8')
                            ]);
                        })
                        .spread(function (docBemjsonSource, dochtmlSource) {
                            data.description = dochtmlSource;
                            data.bemjsonDescription = docBemjsonSource;

                            return JSON.stringify(data);
                        });
                }
            });
    })
    .createTech();
