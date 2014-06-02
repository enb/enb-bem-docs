var path = require('path');

var bemdeclByKeeps = require('enb-bem-sets/plugins/techs/bemdecl-by-keeps');

var levels = require('enb/techs/levels');
var deps = require('enb/techs/deps-old');
var files = require('enb/techs/files');

var md = require('./techs/md-i18n');
var dochtml = require('./techs/doc-html-i18n');
var meta = require('./techs/meta-json');
var jsdoc = require('./techs/jsdoc');

exports.configure = function (config, options) {
    var pattern = path.join(options.destPath, '*');
    var langs = config.getLanguages();

    config.nodes(pattern, function (nodeConfig) {
        // Base techs
        nodeConfig.addTechs([
            [levels, { levels: options.levels }],
            [bemdeclByKeeps],
            [deps],
            [files]
        ]);

        // Markdown techs
        nodeConfig.addTechs(langs.map(function (lang) {
            return [md, {
                lang: lang,
                sourceSuffixes: [lang + '.md']
            }];
        }));

        // Html techs
        nodeConfig.addTechs(langs.map(function (lang) {
            return [dochtml, {
                lang: lang,
                sourceSuffixes: [lang + '.md', lang + '.wiki']
            }];
        }));

        // JsDoc techs
        nodeConfig.addTech([jsdoc]);

        // Meta json techs
        nodeConfig.addTechs([meta]);

        nodeConfig.addTargets([
            '?.{lang}.md', '?.{lang}.doc.html', '?.jsdoc.json', '?.meta.json'
        ]);
    });
};
