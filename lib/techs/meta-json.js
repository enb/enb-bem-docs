var path = require('path');

module.exports = require('enb/lib/build-flow').create()
    .name('meta-json')
    .target('target', '?.meta.json')
    .defineOption('examplePattern')
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

        json.examples = this._getExampleList(this._examplePattern);

        return JSON.stringify(json);
    })
    .methods({
        _getExampleList: function (examplePattern) {
            if (!examplePattern) {
                return [];
            }

            var examplesDirname = path.dirname(this.node.unmaskTargetName(examplePattern));
            var nodes = Object.keys(this.node._makePlatform._projectConfig._nodeConfigs);
            var rootDir = this.node.getRootDir();

            return nodes.filter(function (node) {
                return node.indexOf(examplesDirname) !== -1;
            }).map(function (node) {
                return path.join(rootDir, node);
            });
        }
    })
    .createTech();
