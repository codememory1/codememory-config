const fs = require('fs');
const path = require('path');

/**
 *
 * @type {module.Scanner}
 */
module.exports = class Scanner {

    files = [];

    constructor(path) {
        this.path = path;
    }

    /**
     *
     * @param scanPath
     */
    _scanning(scanPath) {

        fs.readdirSync(scanPath).forEach((value) => {
            const pathWithFile = path.resolve(scanPath + '/' + value);

            if(fs.statSync(pathWithFile).isFile()) {
                if(/^[a-z]+.yaml$/ig.test(value)) {
                    this.files = this.files.concat(pathWithFile);
                }
            } else {
                this._scanning(pathWithFile)
            }
        });
    }

    /**
     *
     * @returns {[]}
     */
    get result() {
        this._scanning(this.path);

        return this.files;
    }

}
