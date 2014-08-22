var marked = require('marked'),
    renderer = require('./renderer'),
    defaultOptions = {
        renderer: renderer.getRenderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false
    };

/**
 * Compile *.md files to html with marked module.
 *
 * @param {String} content content of *.md file
 * @returns {String} html string
 */
module.exports = function (content) {
    marked.setOptions(defaultOptions);

    return marked(content);
};
