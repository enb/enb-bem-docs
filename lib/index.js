var plugin = require('./plugin');

var DocsSetsModule = function (config) {
    this._config = config;

    config.includeConfig('enb-bem-sets');
};

DocsSetsModule.prototype.createConfigurator = function (taskName) {
    var sets = this._config.module('enb-bem-sets');

    return plugin(sets.createConfigurator(taskName));
};

module.exports = function (config) {
    config.registerModule('enb-bem-docs', new DocsSetsModule(config));
};
