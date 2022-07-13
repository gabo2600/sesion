
(()=>{
//variables
var data,usr,changes;

//funciones
var init,draw,onElim,onAdd,onResp,onSubmit;

changes = false;

init = ()=>{
    //obtiene la info del los miembros y elimina el elemento
    let dataElement = document.getElementById("data");
    data = dataElement.value;
    if (data!== '')
        data = JSON.parse(data);
    dataElement.parentElement.removeChild(dataElement);

    //obtiene la info del los miembros y elimina el elemento
    dataElement = document.getElementById("usr");
    usr = dataElement.value;
    if (usr!== '')
        usr = JSON.parse(usr);
    dataElement.parentElement.removeChild(dataElement);
    document.getElementById("apply").disabled = true;

    draw();
}

draw = ()=>{
    let tab = document.getElementById("TabM"),i;
    let sel = document.getElementById("usuarios");

    //elementos
    let row,btnE,btnR,lastCell,opc;
    //tabla
    tab.innerHTML = '<tr class="dark"><th>Nombre completo</th><th>Rol</th><th>Acciòn</th></tr>'
    if (data!=='')
    {
        for(i = 0 ; i<data.length ; i++){
            row = tab.insertRow(1);
            row.insertCell(0).innerHTML = data[i].nombre+" "+data[i].apellidoP+" "+data[i].apellidoM;
            if (data[i].esResp==0){
                row.insertCell(1).innerHTML = "Miembro";
                lastCell = row.insertCell(2);

                btnE = document.createElement("input");
                btnE.type= "button";
                btnE.value="Quitar del Comité";
                btnE.className ="btn btn-dan";
                btnE.onclick = ((x) => ()=>onElim(x))(i);

                btnR = document.createElement("input");
                btnR.type= "button";
                btnR.value="Establecer como responsable";
                btnR.className ="btn btn-pri";
                btnR.onclick = ((x) => ()=>onResp(x))(i);

                lastCell.appendChild(btnE)
                lastCell.appendChild(btnR)
            }else{
                row.insertCell(1).innerHTML = "Responsable del Comité";
                row.insertCell(2).innerHTML = "No se puede eliminar al responsable del Comité";
            }
        }
    }
    //select
    sel.innerHTML = '';
    if (usr!=='')
    {
        for(i = 0 ; i<usr.length ; i++){
            opc = document.createElement("option");
            opc.value = usr[i].idUsuario;
            opc.text = usr[i].nombre+" "+usr[i].apellidoP+""+usr[i].apellidoM;
            sel.add(opc);
        }
    }
    if (changes == true)
        document.getElementById("apply").disabled = false;
}


onElim = (id)=>{
    changes = true;
    //Se obtiene el usuario a eliminar
    let elim = data[id]
    elim = {idUsuario:elim.idUsuario,nombre:elim.nombre, apellidoP:elim.apellidoP, apellidoM:elim.apellidoM}
    usr.push(elim);
    console.log([id,id+1]);
    //se elimina de los meimbros
    if (data[id].esResp !=1)
            data.splice(id,id+1);
    //se redibuja todo
    draw();
}

onAdd = ()=>{
    changes = true;
    //se obtiene los datos de la opcion seleccionada
    let id = document.getElementById('usuarios').value;
    id = parseInt(id);
    let nom = usr.filter((u)=> u.idUsuario==id);
    nom = nom[0];
    //y se borra dicha opcion
    usr = usr.filter((u)=> u.idUsuario!=id);
    //se añaden los datos a la matriz
    let tmp = {idUsuario:id,nombre:nom.nombre,apellidoP:nom.apellidoP,apellidoM:nom.apellidoM,esResp:0}
    if (typeof data === 'string'){
        data = [];
        tmp.esResp=1;
    }
    data.push(tmp);
    draw();
}

onResp = (id)=>{
    changes = true;
    for(let i = 0; i<data.length ; i++)
        data[i].esResp = 0;
    data[id].esResp = 1;
    draw();
}


onSubmit =()=>{
     
    let idComite = document.getElementById("idComite").value;
    let comite = document.getElementById("comite").value;
    parseInt(idComite);
    let aux = [];

    for (let i = 0; i < data.length; i++) {
        aux.push({idUsuario: data[i].idUsuario ,esResp: data[i].esResp });    
    }
    axios.post(
        "/comite/editar",
        {
            idComite:idComite,
            comite:comite,
            miembros:aux
        }).then((res)=>{
            new Control.ok("",res.data.message);
            apply.disabled = true;
            changes = false;
        }).catch(function (error) {
            console.log(error);
    });
    changes=false;
    document.getElementById("apply").disabled = true;

}

volver = async()=>{
    if (changes==true)
        return await modalOkCancel("Alerta","Aun no se an guardado los cambios desea salir de esta pagina?");
    else
        return true;
}


//setup
document.getElementById("add").onclick = onAdd;
document.getElementById("apply").onclick = onSubmit;
document.getElementById("volver").onclick=volver;

document.getElementById("comite").onchange = ()=>{
    changes=true;
    document.getElementById("apply").disabled = false;
}
init();
})();