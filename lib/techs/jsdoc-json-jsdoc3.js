var vow = require('vow'),
    path = require('path'),
    cp = require('child_process'),
    enb = require('enb'),
    which = require('npm-which')(process.cwd()),
    resolveModulePath = require('resolve-module-path'),
    pathToJsdocBin = which.sync('jsdoc'),
    pathToJsdocBem = resolveModulePath('jsdoc-bem'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('jsdoc-json-jsdoc3')
    .target('target', '?.jsdoc.json')
    .useFileList(['js'])
    .builder(function (files) {
        var logger = this.node.getLogger(),
            target = this._target;

        if (files.length === 0) {
            return '{}';
        }

        var jsdoc = cp.spawn(
                pathToJsdocBin, [
                    '-c', path.resolve(__dirname, '../jsdoc3/jsdoc.conf.json'),
                    '-t', path.join(pathToJsdocBem, 'templates', 'docjson')
                ].concat(files.map(function (file) {
                    return file.fullname;
                }))
            ),

            content = '',
            err = '',
            d = vow.defer();

        jsdoc.stdout.on('data', function (data) {
            content += data;
        });

        jsdoc.stderr.on('data', function (data) {
            err += data;
        });

        jsdoc.on('close', function (code) {
            if (code !== 0) {
                logger.logWarningAction('js-doc', target, err);
                return d.resolve('{}');
            }

            d.resolve(content);
        });

        return d.promise();
    })
    .createTech();
