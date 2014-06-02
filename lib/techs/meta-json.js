var path = require('path');

module.exports = require('enb/lib/build-flow').create()
    .name('meta-json')
    .target('target', '?.meta.json')
    .builder(function () {
        var node = this.node;
        var dir = node.getDir();
        var langs = node.getLanguages();
        var name = path.basename(dir);
        var json = {
            block: name
        };

        var jsdocTarget = node.unmaskTargetName('?.jsdoc.json');
        if (node.hasRegisteredTarget(jsdocTarget)) {
            json.jsdocFile = path.join(dir, jsdocTarget);
        }

        var mdFiles = {};
        var dochtmlFiles = {};
        langs.forEach(function (lang) {
            var dochtmlTarget = node.unmaskTargetName('?.' + lang + '.doc.html');
            var mdTarget = node.unmaskTargetName('?.' + lang + '.md');

            if (node.hasRegisteredTarget(mdTarget)) {
                mdFiles[lang] = path.join(dir, mdTarget);
            }

            if (node.hasRegisteredTarget(dochtmlTarget)) {
                dochtmlFiles[lang] = path.join(dir, dochtmlTarget);
            }
        });

        if (Object.keys(mdFiles).length) {
            json.mdFiles = mdFiles;
        }

        if (Object.keys(dochtmlFiles).length) {
            json.dochtmlFiles = dochtmlFiles;
        }

        return JSON.stringify(json);
    })
    .createTech();
