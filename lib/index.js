var plugin = require('./plugin');

function DocsSets(config) {
    var filename = require.resolve('enb-magic-factory');

    this._config = config;

    if (config.getIncludedConfigFilenames().indexOf(filename) === -1) {
        config.includeConfig('enb-magic-factory');
    }
}

DocsSets.prototype.createConfigurator = function (taskName, exampleTaskName) {
    var factory = this._config.module('enb-magic-factory'),
        helper = factory.createHelper(taskName);

    if (exampleTaskName) {
        var exampleHelper = factory.getHelper(exampleTaskName),
            exampleChannel = exampleHelper.getEventChannel();

        return plugin(helper, exampleTaskName, exampleChannel);
    }

    return plugin(helper);
};

module.exports = function (config) {
    config.registerModule('enb-bem-docs', new DocsSets(config));
};
