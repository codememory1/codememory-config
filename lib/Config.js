const yaml = require('yaml');
const fs = require('fs');
let Scanner = require('./Scanner');

class Config {

    allBinds = {};

    setPath(path) {
        this.configPath = path;
        this.data = {};

        return this;
    }

    /**
     *
     * @returns {*[]}
     */
    allConfigs() {
        let scanner = new Scanner(this.configPath);
        let configs = [];

        scanner.result.forEach((file) => {
            const readFile = fs.readFileSync(file, 'utf-8');

            configs = configs.concat(yaml.parse(readFile));
        });

        return configs;
    }

    /**
     *
     * @private
     */
    _handlerBinds() {
        const all = this.allConfigs();

        for (let i = 0; i < all.length; i++) {
            for (let key in all[i]) {
                if(all[i].hasOwnProperty(key)){
                    const currentConfig = all[i][key];

                    if(undefined !== currentConfig.binds) {
                        for(let name in currentConfig.binds) {
                            this.allBinds[name] = currentConfig.binds[name]
                        }
                    }
                }
            }
        }
    }

    /**
     *
     * @returns {Config}
     */
    make() {
        this._handlerBinds();

        return this;
    }

    /**
     *
     * @param bind
     * @returns {{}|*}
     */
    binds(bind = null) {
        if(null !== bind) {
            return this.allBinds[bind];
        }

        return this.allBinds;
    }

    /**
     *
     * @param key
     * @param value
     * @param notExist
     * @returns {Config}
     */
    setBind(key, value, notExist = true) {
        if(notExist) {
            if(undefined === this.allBinds[key]) {
                this.allBinds[key] = value;
            }
        } else {
            this.allBinds[key] = value;
        }

        return this;
    }

    /**
     *
     * @param config
     * @returns {string}
     * @private
     */
    _bindReplacement(config) {
        let data = JSON.stringify(config);

        return JSON.parse(
            data.replace(/%([^%]+)%/gm, (match, bind) => {
                return this.binds(bind);
            })
        );

    }

    open(config) {
        const all = this.allConfigs();

        for (let i = 0; i < all.length; i++) {
            for (let key in all[i]) {
                if(key === config) {
                    if(all[i][config]["binds"]) {
                        delete all[i][config].binds;
                    }

                    this.data = this._bindReplacement(all[i][config]);
                }
            }
        }

        return this;
    }

    /**
     *
     * @param key
     * @returns {*|string}
     */
    get(key = null) {
        if(null === key) {
            return this.data;
        }

        const keys = key.split('.');
        let data = this.data;

        keys.forEach((v) => {
            data = data[v];
        });

        return data;
    }

}

module.exports = new Config();