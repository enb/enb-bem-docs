var promisify = require('vow-node').promisify,
    toc = promisify(require('toc-md').insert),
    convert = require('md-to-bemjson').convertSync,
    DEFAULT_OPTIONS = { tabSize: 4 };

/**
 * Compile *.md files to bemjson
 *
 * @param {String} content content of *.md file
 * @returns {String} bemjson string
 */
module.exports = function (content, options) {
    var tabSize = options && options.tabSize || DEFAULT_OPTIONS.tabSize;

    return toc(content)
        .then(function (res) {
            return JSON.stringify(convert(res), null, tabSize);
        });
};
