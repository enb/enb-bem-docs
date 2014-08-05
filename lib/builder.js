var path = require('path');
var naming = require('bem-naming');

function one(file) {
    var name = file.name.split('.')[0];
    var notation = naming.parse(name);

    return path.join(notation.block, name + '.keep');
}

module.exports = function (options) {
    return function (file) {
        var ext = path.extname(file.name);

        if (options.docSuffixes.indexOf(file.suffix) !== -1 ||
            options.docI18NSuffixes.indexOf(file.suffix) !== -1 ||
            ext === '.js'
        ) {
            return one(file);
        }

        return false;
    };
};
