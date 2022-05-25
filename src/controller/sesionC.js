const model = require("../model/sesionM");
const sesionM = new model();
const controller = require("./controller");


class sesionC extends controller{
    constructor(){
        super();
    }

}

module.exports = sesionC;