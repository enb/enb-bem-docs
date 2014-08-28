var path = require('path'),

    provide = require('enb/techs/file-provider'),
    levels = require('enb-bem/techs/levels'),
    bemdeclToDeps = require('./techs/bemdecl-to-deps'),
    files = require('enb-bem/techs/files'),

    md = require('./techs/md'),
    mdI18N = require('./techs/md-i18n'),
    dochtml = require('./techs/doc-html-i18n'),

    jsdoc = require('./techs/jsdoc-json'),
    jsdoc3 = require('./techs/jsdoc-json-jsdoc3'),
    jsdocToMd = require('./techs/jsdoc-to-md'),
    htmlFromMd = require('./techs/html-from-md'),

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
            [bemdeclToDeps],
            [files]
        ]);

        if (langs && langs.length) {
            // Markdown techs
            nodeConfig.addTechs(langs.map(function (lang) {
                return [mdI18N, {
                    lang: lang,
                    sourceSuffixes: [lang + '.md']
                }];
            }));

            // Html techs
            nodeConfig.addTechs(langs.map(function (lang) {
                return [dochtml, {
                    lang: lang,
                    sourceSuffixes: options.docSuffixes.map(function (suffix) {
                        return lang + '.' + suffix;
                    }),
                    examples: options._examples,
                    hasInlineBemjson: options.exampleSets.length
                }];
            }));

            langs.forEach(function (lang) {
                nodeConfig.addTargets([
                    '?.' + lang + '.md', '?.' + lang + '.doc.html'
                ]);
            });
        } else {
            // Markdown techs
            nodeConfig.addTech([md, {
                sourceSuffixes: options.docSuffixes
            }]);

            // Html techs
            nodeConfig.addTech([dochtml, {
                target: '?.doc.html',
                lang: null,
                sourceSuffixes: options.docSuffixes,
                examples: options._examples,
                hasInlineBemjson: options.exampleSets.length
            }]);

            nodeConfig.addTargets([
                '?.md', '?.doc.html'
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
        if (options.jsdocParser === 'jsd') {
            nodeConfig.addTechs([
                [jsdoc],
                [jsdocToMd],
                [htmlFromMd, {
                    target: '?.jsdoc.html',
                    source: '?.jsdoc.md'
                }]
            ]);

            nodeConfig.addTargets([
                '?.jsdoc.json', '?.jsdoc.html'
            ]);
        } else if (options.jsdocParser === 'jsdoc3') {
            nodeConfig.addTechs([
                [jsdoc3]
            ]);

            nodeConfig.addTargets([
                '?.jsdoc.json'
            ]);
        }

        nodeConfig.addTargets([
            '?.meta.json', '?.data.json'
        ]);
    });
};
