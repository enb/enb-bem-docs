var path = require('path');

module.exports = require('enb/lib/build-flow').create()
    .name('meta-json')
    .target('target', '?.meta.json')
    .defineOption('langs', [])
    .defineOption('examples', [])
    .builder(function () {
        var node = this.node,
            dir = node.getDir(),
            bemname = node.getPath().split(path.sep)[1],
            langs = this._langs,
            name = path.basename(dir),
            json = {
                block: name,
                // Оставляем примеры только для текущего блока
                examples: this._examples.filter(function (example) {
                    return example.path.split(path.sep)[1] === bemname;
                })
            },
            jsdocTarget = node.unmaskTargetName('?.jsdoc.json');

        if (node.hasRegisteredTarget(jsdocTarget)) {
            json.jsdocFile = path.join(dir, jsdocTarget);
        }

        var mdFiles = [],
            dochtmlFiles = [];

        if (langs && langs.length) {
            langs.forEach(function (lang) {
                var dochtmlTarget = node.unmaskTargetName('?.' + lang + '.doc.html'),
                    mdTarget = node.unmaskTargetName('?.' + lang + '.md');

                if (node.hasRegisteredTarget(mdTarget)) {
                    mdFiles.push(path.join(dir, mdTarget));
                }

                if (node.hasRegisteredTarget(dochtmlTarget)) {
                    dochtmlFiles.push(path.join(dir, dochtmlTarget));
                }
            });
        } else {
            var dochtmlTarget = node.unmaskTargetName('?.doc.html'),
                mdTarget = node.unmaskTargetName('?.md');

            if (node.hasRegisteredTarget(mdTarget)) {
                mdFiles.push(path.join(dir, mdTarget));
            }

            if (node.hasRegisteredTarget(dochtmlTarget)) {
                dochtmlFiles.push(path.join(dir, dochtmlTarget));
            }
        }

        if (Object.keys(mdFiles).length) {
            json.mdFiles = mdFiles;
        }

        if (Object.keys(dochtmlFiles).length) {
            json.dochtmlFiles = dochtmlFiles;
        }

        return JSON.stringify(json);
    })
    .createTech();
