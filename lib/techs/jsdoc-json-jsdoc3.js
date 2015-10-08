var vow = require('vow'),
    path = require('path'),
    cp = require('child_process'),
    enb = require('enb'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow');

module.exports = buildFlow.create()
    .name('jsdoc-json-jsdoc3')
    .target('target', '?.jsdoc.json')
    .useFileList(['js'])
    .builder(function (files) {
        var isWinOS = path.sep === '\\',
            logger = this.node.getLogger(),
            target = this._target;

        if (files.length === 0) {
            return '{}';
        }

        var jsdoc = cp.spawn(
                path.resolve(__dirname, '../../node_modules/.bin/jsdoc' + (isWinOS ? '.cmd' : '')), [
                    '-c', path.resolve(__dirname, '../jsdoc3/jsdoc.conf.json'),
                    '-t', path.resolve(__dirname, '../../node_modules/jsdoc-bem/templates/docjson')
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
                logger.logWarningAction('js-doc', target, err.stack);
                return d.resolve('{}');
            }

            d.resolve(content);
        });

        return d.promise();
    })
    .createTech();
