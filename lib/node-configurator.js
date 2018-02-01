var path = require('path'),

    provide = require('enb/techs/file-provider'),
    levels = require('enb-bem-techs/techs/levels'),
    files = require('enb-bem-techs/techs/files'),

    md = require('./techs/md'),
    mdI18N = require('./techs/md-i18n'),
    dochtml = require('./techs/doc-html-i18n'),
    docbemjson = require('./techs/doc-bemjson-i18n'),

    jsdoc = require('./techs/jsdoc-json'),
    jsdoc3 = require('./techs/jsdoc-json-jsdoc3'),
    jsdocToMd = require('./techs/jsdoc-to-md'),
    htmlFromMd = require('./techs/html-from-md'),
    bemjsonFromMd = require('./techs/bemjson-from-md'),

    meta = require('./techs/meta-json'),
    data = require('./techs/data-json');

exports.configure = function (config, options) {
    var pattern = path.join(options.destPath, '*'),
        langs = options.langs;

    config.nodes(pattern, function (nodeConfig) {
        // Base techs
        nodeConfig.addTechs([
            [levels, { levels: options.levels }],
            [provide, { target: '?.bemdecl.js' }],
            [files, {
                depsFile: '?.bemdecl.js'
            }]
        ]);

        if (langs && langs.length) {
            // Markdown techs
            nodeConfig.addTechs(langs.map(function (lang) {
                return [mdI18N, {
                    lang: lang,
                    sourceSuffixes: [lang + '.md']
                }];
            }));

            // bemjson/html techs
            [dochtml, docbemjson].forEach(function (tech) {
                nodeConfig.addTechs(langs.map(function (lang) {
                    return [tech, {
                        lang: lang,
                        sourceSuffixes: options.docSuffixes.map(function (suffix) {
                            return lang + '.' + suffix;
                        }),
                        examples: options._examples,
                        hasInlineBemjson: options.exampleSets.length
                    }];
                }));
            });

            langs.forEach(function (lang) {
                nodeConfig.addTargets([
                    '?.' + lang + '.md',
                    '?.' + lang + '.doc.bemjson.js',
                    '?.' + lang + '.doc.html'
                ]);
            });
        } else {
            // Markdown techs
            nodeConfig.addTech([md, {
                sourceSuffixes: options.docSuffixes
            }]);

            // bemjson/html techs
            [
                {
                    tech: docbemjson,
                    targetExt: 'bemjson.js'
                },
                {
                    tech: dochtml,
                    targetExt: 'html'
                }
            ].forEach(function (techInfo) {
                nodeConfig.addTech([techInfo.tech, {
                    target: '?.doc.' + techInfo.targetExt,
                    lang: null,
                    sourceSuffixes: options.docSuffixes,
                    examples: options._examples,
                    hasInlineBemjson: options.exampleSets.length
                }]);
            });

            nodeConfig.addTargets([
                '?.md', '?.doc.bemjson.js', '?.doc.html'
            ]);
        }

        // Meta json techs
        nodeConfig.addTechs([
            [meta, {
                langs: langs,
                examples: options._examples
            }],
            [data, {
                langs: langs
            }]
        ]);

        // JsDoc techs
        if (options.jsdoc) {
            if (options.jsdoc.parser === 'jsd') {
                nodeConfig.addTechs([
                    [jsdoc, { sourceSuffixes: options.jsdoc.suffixes }],
                    [jsdocToMd],
                    [bemjsonFromMd, {
                        target: '?.jsdoc.bemjson.js',
                        source: '?.jsdoc.md'
                    }],
                    [htmlFromMd, {
                        target: '?.jsdoc.html',
                        source: '?.jsdoc.md'
                    }]
                ]);

                nodeConfig.addTargets([
                    '?.jsdoc.json', '?.jsdoc.bemjson.js', '?.jsdoc.html'
                ]);
            } else if (options.jsdoc.parser === 'jsdoc3') {
                nodeConfig.addTech([jsdoc3, { sourceSuffixes: options.jsdoc.suffixes }]);

                nodeConfig.addTargets([
                    '?.jsdoc.json'
                ]);
            }
        }

        nodeConfig.addTargets([
            '?.meta.json', '?.data.json'
        ]);
    });
};
