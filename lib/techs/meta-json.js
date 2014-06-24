var path = require('path');

module.exports = require('enb/lib/build-flow').create()
    .name('meta-json')
    .target('target', '?.meta.json')
    .defineOption('examplePattern')
    .defineOption('inlineExamplePattern')
    .builder(function () {
        var node = this.node;
        var dir = node.getDir();
        var langs = node.getLanguages();
        var name = path.basename(dir);
        var inlineExamplePattern = this._inlineExamplePattern && this.node.unmaskTargetName(this._inlineExamplePattern);
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

        json.examples = this._getExampleList(initExamplePattern(node, this._examplePattern), inlineExamplePattern);

        return JSON.stringify(json);
    })
    .methods({
        _getExampleList: function (examplePattern, inlineExamplePattern) {
            if (examplePattern.length === 0) {
                return [];
            }

            var examplesDirnames = examplePattern.map(function (pattern) {
                return path.dirname(pattern);
            });
            var inlineExamplesDirname = path.dirname(inlineExamplePattern);
            var nodes = Object.keys(this.node._makePlatform._projectConfig._nodeConfigs);
            var rootDir = this.node.getRootDir();

            return nodes.filter(function (node) {
                if (node.indexOf(inlineExamplesDirname) !== -1) {
                    return false;
                }

                var has = false;

                examplesDirnames.forEach(function (dirname) {
                    if (node.indexOf(dirname) !== -1) {
                        has = true;
                    }
                });

                return has;
            }).map(function (node) {
                return path.join(rootDir, node);
            });
        }
    })
    .createTech();

function initExamplePattern(node, examplePattern) {
    if (!examplePattern) {
        return [];
    }

    if (typeof examplePattern === 'string') {
        examplePattern = [examplePattern];
    }

    return examplePattern.map(function (pattern) {
        return node.unmaskTargetName(pattern);
    });
}
