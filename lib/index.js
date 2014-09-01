var plugin = require('./plugin');

function DocsSets(config) {
    this._config = config;

    config.includeConfig(require.resolve('enb-magic-factory'));
}

DocsSets.prototype.createConfigurator = function (taskName, exampleTaskName) {
    var factory = this._config.module('enb-magic-factory'),
        helper = factory.createHelper(taskName);

    if (exampleTaskName) {
        return plugin(helper, factory, exampleTaskName);
    }

    return plugin(helper, factory);
};

module.exports = function (config) {
    config.registerModule('enb-bem-docs', new DocsSets(config));
};
