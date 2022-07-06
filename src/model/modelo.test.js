const model = require("./model");
let m = new model("comite");

test('find = async(par = {}, campos = undefined)', async() => {
    const res = await m.find({},['idComite','comite']);
    expect(typeof res).toBe('object');
});
/*
test('findCustom = async(sql)', async() => {
    const res = await m.findCustom("Truncate comite");
    expect(res).toBe(undefined);
});

test('crear = async(par)', async() => {
    const res = await m.crear({comite:"Comite"})
    expect(res).toBe(1);
});

test('borrarS = async(par)', async() => {
    const res = await m.borrarS({idComite:1})
    expect(res).toBe(true);
});

test('restaurarS = async(par)', async() => {
    const res = await m.restaurarS({idComite:1})
    expect(res).toBe(true);
});

test('editar = async(param, where)',async() => {
    const res = await m.editar({comite:"ssss"},{idComite:1})
    expect(res).toBe(true);
});

test('find = async(par = {}, campos = undefined)', async() => {
    const res = await m.find({idComite:1},['idComite','comite']);
    expect(typeof res).toBe('object');
});

test('existe = async(par)', async() => {
    const res = await m.existe({idComite:1});
    expect(res).toBe(true);
});

test('search = async(keys, words = "", where = {})', async() => {
    const res = await m.search(['comite'],"ss",borrado=1);
    expect(typeof res).toBe('object');
});


test('borrar = async(par)', async() => {
    const res = await m.borrar({idComite:1})
    expect(res).toBe(true);
});

test('existe = async(par)', () => {
    expect(sum(1, 2)).toBe(3);
});

test('search = async(keys, words = "", where = {})', () => {
    expect(sum(1, 2)).toBe(3);
});


test('findJoint = async(tablas, where = undefined, campos = false)', () => {
    expect(sum(1, 2)).toBe(3);
});

test('findCustom = async(sql)', () => {
    expect(sum(1, 2)).toBe(3);
});

*/


