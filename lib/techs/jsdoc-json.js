var vow = require('vow'),
    enb = require('enb'),
    vfs = enb.asyncFS || require('enb/lib/fs/async-fs'),
    buildFlow = enb.buildFlow || require('enb/lib/build-flow'),
    bemjsd = require('bem-jsd'),
    naming = require('bem-naming');

module.exports = buildFlow.create()
    .name('jsdoc-json')
    .target('target', '?.jsdoc.json')
    .useFileList(['js'])
    .builder(function (files) {
        var logger = this.node.getLogger(),
            target = this._target;

        return vow.all(files.map(function (file) {
                var basename = file.name.split('.')[0],
                    entity = naming.parse(basename);

                return vfs.read(file.fullname, 'utf8')
                    .then(function (src) {
                        var data = {};

                        if (src.length) {
                            // 'jsd' which is used by 'bem-jsd' does not handle Windows OS linebreaks
                            data = bemjsd(src.replace(/\r/g, ''));

                            // 'bemjsd' returns { jsdocType: 'root' } for files without JSDoc
                            if (Object.keys(data).length < 2) {
                                data = {};
                            }
                        }

                        return {
                            entity: entity,
                            data: data
                        };
                    });
            }))
            .then(function (parts) {
                var sortedParts = parts.sort(function (part1, part2) {
                    return Object.keys(part1.entity).length - Object.keys(part2.entity).length;
                });

                return JSON.stringify(sortedParts);
            })
            .fail(function (e) {
                logger.logWarningAction('js-doc', target, e.stack);

                return '{}';
            });
    })
    .createTech();
