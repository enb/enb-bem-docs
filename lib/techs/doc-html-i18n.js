var path = require('path');
var crypto = require('crypto');
var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var marked = require('../marked');
var shmakowiki = require('shmakowiki');
var BEMJSON_CODE_REGEX = /`{3}bemjson\n([^`]*)\n`{3}/gi;

module.exports = require('enb/lib/build-flow').create()
    .name('doc-html-i18n')
    .target('target', '?.{lang}.doc.html')
    .defineRequiredOption('lang')
    .defineOption('hasInlineBemjson', false)
    .defineOption('examples', [])
    .useFileList(['{lang}.md', '{lang}.wiki'])
    .builder(function (files) {
        var hasInlineBemjson = this._hasInlineBemjson;
        var examples = this._examples;
        var exampleMap = {};

        examples.forEach(function (example) {
            if (example.source) {
                exampleMap[example.name] = example;
            }
        });

        return vow.all(files.map(function (file) {
            var filename = file.fullname;

            return vfs.read(filename, 'utf-8')
                .then(function (source) {
                    var ext = path.extname(filename);

                    if (hasInlineBemjson) {
                        source = processBemjsonInSource(source, exampleMap);
                    }

                    if (ext === '.md') {
                        return marked(source);
                    }

                    if (ext === '.wiki') {
                        return shmakowiki.shmakowikiToHtml(source);
                    }

                    return source;
                });
        }))
        .then(function (sources) {
            return sources.join('\n');
        });
    })
    .createTech();

function processBemjsonInSource(source, examples) {
    return source.replace(BEMJSON_CODE_REGEX, function (match) {
        var code = match.split('\n').slice(1);

        code.pop();
        code = code.join('\n');

        var shasum = crypto.createHash('sha1'); shasum.update(code);
        var base64 = fixBase64(shasum.digest('base64'));

        return '<!-- bem-example: ' + examples[base64].path + ' -->';
    });
}

function fixBase64(base64) {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .replace(/^[+-]+/g, '');
}
