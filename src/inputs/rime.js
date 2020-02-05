const { app } = require('electron');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const exec = require('child_process').exec;

class Rime {
    constructor() {
        if (process.platform == 'darwin') {
            this.path = app.getPath('home') + "/Library/Rime";
            this.defaultConfigPath = this.path + "/default.custom.yaml";
            this.lunaPinyinPath = this.path + "/luna_pinyin.custom.yaml";
            this.lunaDictionayPath = this.path + "/luna_pinyin.duo.dict.yaml";
        } else {
            this.path = "%APPDATA%\\Rime";
            this.defaultConfigPath = this.path + "\\default.custom.yaml";
            this.lunaPinyinPath = this.path + "\\luna_pinyin.custom.yaml";
            this.lunaDictionayPath = this.path + "\\luna_pinyin.duo.dict.yaml";
        }

        //this.loadDefaultConfig();
        this.loadLunaConfig();
        this.loadLunaDictionary();
    }

    loadDefaultConfig() {
        if (fs.existsSync(this.defaultConfigPath) == false) {
            this.createDefaultConfig();
            return;
        }

        this.defaultConfig = yaml.safeLoad(fs.readFileSync(this.defaultConfigPath, 'utf8'));
    }

    createDefaultConfig() {
        this.defaultConfig = {
            schema: {
                schema_id: 'default',
                name: '定製配置',
                version: '1.0',
            },
            patch: {
                switcher: {
                    hotkeys: [
                        "Control+Shift+0"
                    ]
                },
            },
            schema_list: [
                {
                    schema: 'luna_pinyin'
                },
                {
                    schema: 'luna_pinyin_simp'
                },
                {
                    schema: 'luna_pinyin_tw'
                },
            ],
        };

        this.saveYaml(this.defaultConfig, this.defaultConfigPath);
    }

    loadLunaConfig() {
        if (fs.existsSync(this.lunaPinyinPath) == false) {
            this.createLunaConfig();
            return;
        }
        
        this.lunaConfig = yaml.safeLoad(fs.readFileSync(this.lunaPinyinPath, 'utf8'));
        if (!this.lunaConfig) {
            this.createLunaConfig();
            return;
        }

        if (!this.lunaConfig.patch) {
            this.lunaConfig.patch = {
                translator : {
                    dictionary: "luna_pinyin.duo",
                },
            };

            this.saveYaml(this.lunaConfig, this.lunaPinyinPath);
        }
        
        if (!this.lunaConfig.patch.translator) {
            this.lunaConfig.patch.translator = {
                dictionary: "luna_pinyin.duo",
            };

            this.saveYaml(this.lunaConfig, this.lunaPinyinPath);
        }
        
        if (!this.lunaConfig.patch.translator.dictionary) {
            this.lunaConfig.patch.translator.dictionary = "luna_pinyin.duo";
            this.saveYaml(this.lunaConfig, this.lunaPinyinPath);
        }

        if (this.lunaConfig.patch.translator.dictionary != "luna_pinyin.duo") {
            fs.copyFileSync(this.lunaPinyinPath, this.lunaPinyinPath + ".bak");
            this.createLunaConfig();
        }
    }

    createLunaConfig() {
        this.lunaConfig = {
            patch: {
                translator: {
                    dictionary: 'luna_pinyin.duo',
                },
            },
        };

        this.saveYaml(this.lunaConfig, this.lunaPinyinPath);
    }

    loadLunaDictionary() {
        if (fs.existsSync(this.lunaDictionayPath) == false) {
            this.createLunaDictionary();
            return;
        }

        this.lunaDictionary = yaml.safeLoad(fs.readFileSync(this.lunaDictionayPath, 'utf8'));
        if (!this.lunaDictionary.import_tables) {
            this.lunaDictionary.import_tables = [
                'luna_pinyin',
            ];

            this.saveYaml(this.lunaDictionary, this.lunaDictionayPath);
        }
    }

    createLunaDictionary() {
        this.lunaDictionary = {
            name: 'luna_pinyin.duo',
            version: this.getVersion(),
            use_preset_vocabulary: true,
            import_tables: [
                'luna_pinyin',
            ],
        };

        this.saveYaml(this.lunaDictionary, this.lunaDictionayPath);
    }

    getDicts() {
        var dicts = [];
        this.lunaDictionary.import_tables.forEach(dictName => {
            if (dictName == "luna_pinyin" || !dictName.startsWith("duo.")) {
                return;
            }

            const dict = this.getByName(dictName);
            if (!dict) {
                return;
            }

            dict["checked"] = true;
            dicts.push(dict);
        });
        
        fs.readdirSync(this.path).forEach(file => {
            if (!file.startsWith("duo.")) {
                return;
            }

            const dictName = file.replace(".dict.yaml", "");
            if (this.lunaDictionary.import_tables.indexOf(dictName) == -1) {
                const dict = this.getByName(dictName);
                if (!dict) {
                    return;
                }

                dict["checked"] = false;
                dicts.push(dict);
            }
        });

        return dicts;
    }

    insertDict(dict) {
        this.openDict(dict);
        this.saveDict(dict);
    }

    updateDict(dict) {
        this.insertDict(dict);
    }

    openDict(dict) {
        if (this.lunaDictionary.import_tables.indexOf(dict.id) == -1) {
            this.lunaDictionary.import_tables.push(dict.id);
            this.saveYaml(this.lunaDictionary, this.lunaDictionayPath);
        }
    }

    removeDict(dict) {
        const i = this.lunaDictionary.import_tables.indexOf(dict.id);
        if (i > -1) {
            this.lunaDictionary.import_tables.splice(i, 1);
            this.saveYaml(this.lunaDictionary, this.lunaDictionayPath);
        }
    }

    reload() {
        if (process.platform == 'darwin') {
            const command = '/Library/Input\\ Methods/Squirrel.app/Contents/MacOS/Squirrel --reload';
            exec(command, (error, stdout, stderr) => { 
                log.debug(error, stdout, stderr);
            });
        }
    }

    saveDict(dict) {
        var path = this.path + ((process.platform == 'darwin') ? "/" : "\\") + dict.id + ".dict.yaml";
        var content = this.getDictContent(dict);
        try {
            if (fs.writeFileSync(path, content)) {
                log.debug('Dict %s saved', path);
            }
        } catch (e) {
            log.error(e);
        }
    }

    getDictContent(dict) {
        var infos = {
            name: dict.id,
            version: this.getVersion(),
            sort: "by_weight",
            use_preset_vocabulary: true,
            title: dict.title,
            source: dict.source,
            count: dict.count,
            description: dict.description,
            category: dict.category,
            extension: dict.extension,
        };

        var lines = [];
        lines.push("# Rime dictionary");
        lines.push("# encoding: utf-8");
        lines.push("");
        lines.push("---");
        for (const key in infos) {
            lines.push(key + ": \""  + infos[key] + "\""); //TODO escape
        }
        lines.push("...");
        lines.push("");
        dict.words.forEach(w => {
            lines.push(w.word + "\t" + w.pinyin + "\t1");
        });

        return lines.join("\n");
    }

    saveYaml(object, path) {
        try {
            if (fs.writeFileSync(path, yaml.safeDump(object))) {
                log.debug('Yaml %s saved', path);
            }
        } catch (e) {
            log.error(e);
        }
    }

    getByName(name) {
        const dictPath = this.path + ((process.platform == 'darwin') ? "/" : "\\") + name + ".dict.yaml";
        if (!fs.existsSync(dictPath)) {
            return false;
        }
        
        const content = fs.readFileSync(dictPath, "UTF-8");
        const lines = content.split(/\r?\n/);
        var dict = {};
        for (let index = 0; index < lines.length; index++) {
            var line = lines[index];
            if (line == "..." || dict.length >= 10) {
                break;
            }

            line = line.trim();

            if (line.length == 0 || line[0] == "#") {
                continue;
            }

            const tmp = line.split(": ");
            if (tmp.length == 2) {
                dict[tmp[0]] = tmp[1].split('"').join("");
            }
        }

        dict["id"] = dict["name"];
        return dict;
    }

    getVersion() {
        const d = new Date();
        return "" + d.getFullYear() + "." + ("0" + d.getDate()).slice(-2) + "." + ("0"+(d.getMonth()+1)).slice(-2) + "." + ("0" + d.getHours()).slice(-2) + "" + ("0" + d.getMinutes()).slice(-2);    
    }
}

module.exports = { Rime };