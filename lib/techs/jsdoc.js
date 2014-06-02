var vow = require('vow');
var vfs = require('enb/lib/fs/async-fs');
var bemjsd = require('bem-jsd');

module.exports = require('enb/lib/build-flow').create()
    .name('jsdoc-json')
    .target('target', '?.jsdoc.json')
    .useFileList(['js'])
    .builder(function (files) {
        return vow.all(files.map(function (file) {
                return vfs.read(file.fullname, 'utf8');
            }))
            .then(function (sources) {
                var json = bemjsd(sources.join('\n'));

                return JSON.stringify(json);
            })
            .fail(function () {
                return '{}';
            });
    })
    .createTech();
