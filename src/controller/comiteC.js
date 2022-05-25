const model = require("../model/comiteM");
const comiteM = new model();
const controller = require("./controller");

class comiteC extends controller{
    constructor(){
        super();
    }

}

module.exports = comiteC;