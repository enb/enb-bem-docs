var vow = require('vow'),
    path = require('path'),
    cp = require('child_process');

module.exports = require('enb/lib/build-flow').create()
    .name('jsdoc-json-jsdoc3')
    .target('target', '?.jsdoc.json')
    .useFileList(['js'])
    .builder(function (files) {
        var isWinOS = path.sep === '\\';

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
                throw new Error(err);
            }
            d.resolve(content);
        });

        return d.promise();
    })
    .createTech();
