const model = require("../model/observacionM");
const observacionM = new model();
const controller = require("./controller");


class observacionC extends controller{
    constructor(){
        super();
    }

}

module.exports = observacionC;