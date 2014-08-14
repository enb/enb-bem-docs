var plugin = require('./plugin');

var DocsSets = function (config) {
    this._config = config;

    config.includeConfig('enb-magic-factory');
};

DocsSets.prototype.createConfigurator = function (taskName) {
    var sets = this._config.module('enb-magic-factory');

    return plugin(sets.createHelper(taskName));
};

module.exports = function (config) {
    config.registerModule('enb-bem-docs', new DocsSets(config));
};
