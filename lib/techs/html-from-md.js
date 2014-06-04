var extend = require('extend');
var marked = require('marked');
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
    .name('html-from-md')
    .target('target', '?.html')
    .defineOption('markedOptions', {})
    .useSourceText('source', '?.md')
    .builder(function (source) {
        marked.setOptions(extend({}, markedDefaultOptions, this._markedOptions));

        return marked(source);
    })
    .createTech();
