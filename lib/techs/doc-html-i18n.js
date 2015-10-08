var path = require('path'),
    crypto = require('crypto'),
    EOL = require('os').EOL,
    vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    marked = require('../marked'),
    shmakowiki = require('shmakowiki'),
    BEMJSON_JS_CODE_REGEX = /`{3,}(bemjson\r?\n[^`]*|js\r?\n\(?(\{|\[)[^`]*block ?:[^`]*(\]|\})\)?)\r?\n`{3,}/gi;

module.exports = buildFlow.create()
    .name('doc-html-i18n')
    .target('target', '?.{lang}.doc.html')
    .defineRequiredOption('lang')
    .defineOption('hasInlineBemjson', false)
    .defineOption('examples', [])
    .useFileList(['{lang}.md', '{lang}.wiki'])
    .builder(function (files) {
        var hasInlineBemjson = this._hasInlineBemjson,
            examples = this._examples,
            exampleMap = {};

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
                        // 'shamakowiki' does not handle Windows OS linebreaks
                        return shmakowiki.shmakowikiToHtml(source.replace(/\r/g, ''));
                    }

                    return source;
                });
        }))
        .then(function (sources) {
            return sources.join(EOL);
        });
    })
    .createTech();

function processBemjsonInSource(source, examples) {
    return source.replace(BEMJSON_JS_CODE_REGEX, function (match) {
        var code = match.split(/\r?\n/).slice(1);

        code.pop();
        code = code.join(EOL);

        var shasum = crypto.createHash('sha1'); shasum.update(code);
        var base64 = fixBase64(shasum.digest('base64'));

        return examples[base64] ? '<!-- bem-example: ' + examples[base64].path + ' -->' : '';
    });
}

function fixBase64(base64) {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .replace(/^[+-]+/g, '');
}
