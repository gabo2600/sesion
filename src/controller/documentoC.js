const model = require("../model/documentoM");
const documentoM = new model();
const controller = require("./controller");


class documentoC extends controller{
    constructor(){
        super();
    }

}

module.exports = documentoC;