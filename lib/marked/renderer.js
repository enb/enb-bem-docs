var marked = require('marked'),
    renderer;

function createRenderer() {
    renderer = new marked.Renderer();

    /**
     * Fix marked issue with cyrillic symbols replacing.
     *
     * @param {String} text test of header
     * @param {Number} level index of header
     * @param {String} raw
     * @param {Object} options options
     * @returns {String} result header string
     */
    renderer.heading = function (text, level, raw, options) {
        var specials = [
                '-', '[', ']', '/', '{', '}', '(', ')', '*', '+', '?', '.', '\\', '^', '$', '|', '\\ ', '\'', '\"'
            ],
            anchor;

        options = options || {};
        options.headerPrefix = options.headerPrefix || '';

        anchor = options.headerPrefix + raw.replace(new RegExp('[' + specials.join('\\') + ']', 'g'), '-');

        return '<h' + level + ' id="' + anchor + '"><a href="#' + anchor + '" class="anchor"></a>' +
            text + '</h' + level + '>\n';
    };

    // Fix(hidden) post scroll, when it contains wide table
    renderer.table = function (header, body) {
        return '<div class="table-container">' +
            '<table>\n' +
            '<thead>\n' +
            header +
            '</thead>\n' +
            '<tbody>\n' +
            body +
            '</tbody>\n' +
            '</table>\n' +
            '</div>';
    };

    // Add container for inline html tables
    renderer.html = function (source) {
        var newHtml = source.replace(/<table>/, '<div class="table-container"><table>');
        return newHtml.replace(/<\/table>/, '</table></div>');
    };

    return renderer;
}

exports.getRenderer = function () {
    return renderer || createRenderer();
};
