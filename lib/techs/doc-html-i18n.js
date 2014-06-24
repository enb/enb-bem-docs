var path = require('path');
var crypto = require('crypto');
var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var extend = require('extend-object');
var marked = require('marked');
var shmakowiki = require('shmakowiki');
var markedDefaultOptions = {
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
};
var BEMJSON_CODE_REGEX = /`{3}bemjson\n([^`]*)\n`{3}/gi;

module.exports = require('enb/lib/build-flow').create()
    .name('doc-html-i18n')
    .target('target', '?.{lang}.doc.html')
    .defineRequiredOption('lang')
    .defineOption('markedOptions', {})
    .defineOption('inlineExamplePattern')
    .useFileList(['{lang}.md', '{lang}.wiki'])
    .builder(function (files) {
        var inlineExamplePattern = this._inlineExamplePattern && this.node.unmaskTargetName(this._inlineExamplePattern);

        marked.setOptions(extend({}, markedDefaultOptions, this._markedOptions));

        return vow.all(files.map(function (file) {
            var filename = file.fullname;

            return vfs.read(filename, 'utf-8')
                .then(function (source) {
                    var ext = path.extname(filename);

                    if (inlineExamplePattern) {
                        source = processBemjsonInSource(source, inlineExamplePattern);
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

function processBemjsonInSource(source, inlineExamplePattern) {
    return source.replace(BEMJSON_CODE_REGEX, function (match) {
        var code = match.split('\n').slice(1);

        code.pop();
        code = code.join('\n');

        var shasum = crypto.createHash('sha1'); shasum.update(code);
        var base64 = fixBase64(shasum.digest('base64'));

        return '<!-- bem-example: ' + inlineExamplePattern.replace('*', base64) + ' -->';
    });
}

function fixBase64(base64) {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .replace(/^[+-]+/g, '');
}
