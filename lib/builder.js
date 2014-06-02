var path = require('path');
var naming = require('bem-naming');

function one(file) {
    var name = file.name.split('.')[0];
    var notation = naming.parse(name);

    return path.join(notation.block, name + '.keep');
}

module.exports = function (options) {
    options || (options = {});

    var suffixes = options.suffixes || ['md', 'wiki'];

    return function (file) {
        if (~suffixes.indexOf(file.suffix)) {
            return one(file);
        }

        return false;
    };
};
