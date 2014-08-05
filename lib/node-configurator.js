var path = require('path');

var provide = require('enb/techs/file-provider');
var levels = require('enb-bem/techs/levels');
var deps = require('enb-bem/techs/deps-old');
var files = require('enb-bem/techs/files');

var md = require('./techs/md');
var mdI18N = require('./techs/md-i18n');
var dochtml = require('./techs/doc-html-i18n');

var jsdoc = require('./techs/jsdoc-json');
var jsdocToMd = require('./techs/jsdoc-to-md');
var htmlFromMd = require('./techs/html-from-md');

var meta = require('./techs/meta-json');
var data = require('./techs/data-json');

exports.configure = function (config, options) {
    var pattern = path.join(options.destPath, '*');
    var langs = options.langs;

    config.nodes(pattern, function (nodeConfig) {
        // Base techs
        nodeConfig.addTechs([
            [levels, { levels: options.levels }],
            [provide, { target: '?.bemdecl.js' }],
            [deps],
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
                    inlineExamplePattern: options.inlineExamplePattern
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
                inlineExamplePattern: options.inlineExamplePattern
            }]);

            nodeConfig.addTargets([
                '?.md', '?.doc.html'
            ]);
        }

        // JsDoc techs
        nodeConfig.addTechs([
            [jsdoc],
            [jsdocToMd],
            [htmlFromMd, {
                target: '?.jsdoc.html',
                source: '?.jsdoc.md'
            }]
        ]);

        // Meta json techs
        nodeConfig.addTechs([
            [meta, {
                langs: langs,
                examplePattern: options.examplePattern,
                inlineExamplePattern: options.inlineExamplePattern
            }],
            [data, {
                langs: langs
            }]
        ]);

        nodeConfig.addTargets([
            '?.jsdoc.json', '?.jsdoc.html', '?.meta.json', '?.data.json'
        ]);
    });
};
