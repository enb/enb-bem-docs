var path = require('path');
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

module.exports = require('enb/lib/build-flow').create()
    .name('doc-html-i18n')
    .target('target', '?.{lang}.doc.html')
    .defineRequiredOption('lang')
    .defineOption('markedOptions', {})
    .useFileList(['{lang}.md', '{lang}.wiki'])
    .builder(function (files) {
        marked.setOptions(extend({}, markedDefaultOptions, this._markedOptions));

        return vow.all(files.map(function (file) {
                var filename = file.fullname;

                return vfs.read(filename, 'utf-8')
                    .then(function (source) {
                        var ext = path.extname(filename);

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
