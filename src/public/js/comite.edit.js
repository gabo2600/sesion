//funciones
let changes;
let onElim;
let onRespChange;
let onApply;
let onChanges;
let onInit;
let onAdd;

changes = false;

onInit = ()=>{
    let tabRows = document.getElementById("TabM").rows;
    let id;
    let btnElim;
    let btnResp;

    for(let i = 1 ; i<tabRows.length ; i++){
        id = parseInt(tabRows[i].cells[0].children[0].value);
        res = parseInt(tabRows[i].cells[0].children[1].value);

        tabRows[i].cells[2].innerHTML = '';
        if (res===0){
            
            btnElim = document.createElement("input");
            btnElim.type= "button";
            btnElim.value="Quitar del Comité";
            btnElim.className ="btn btn-dan";
            btnElim.onclick = ((x) => ()=>onElim(x))(id);

            btnResp = document.createElement("input");
            btnResp.type= "button";
            btnResp.value="Establecer como responsable";
            btnResp.className ="btn btn-pri";
            btnResp.onclick = ((x) => ()=>onRespChange(x))(id);
            
            console.log([btnElim,btnResp]);
            
            tabRows[i].cells[2].appendChild(btnElim)
            tabRows[i].cells[2].appendChild(btnResp)
            
        }
        else
            tabRows[i].cells[2].innerHTML = 'No se puede eliminar al responsable del Comité';
        console.log(i)
    }


    //tab.
}

onElim = (id) => {
    let tabRows = document.getElementById("TabM").rows;
    let idUsr;
    let sel = document.getElementById("usuarios");

    for(let i = 1 ; i<tabRows.length ; i++){
        idUsr = parseInt(tabRows[i].cells[0].children[0].value);
        if (idUsr == id)
        {
            opc = document.createElement("option");
            opc.text = tabRows[1].cells[0].children[2].innerHTML;
            opc.value ='{"'+id+'": "'+tabRows[1].cells[0].children[2].innerHTML+'"}';
            sel.add(opc);
            document.getElementById("TabM").deleteRow(i);
        }
    }
    onInit();
    onChanges();
}

onRespChange =(id)=>{
    let tabRows = document.getElementById("TabM").rows;
    let idUsr;

    for(let i = 1 ; i<tabRows.length ; i++){
        idUsr = parseInt(tabRows[i].cells[0].children[0].value);
        if (idUsr == id)
        {
            tabRows[i].cells[0].children[1].value = 1;
            tabRows[i].cells[1].innerHTML = "Responsable del comité";
        }
        else
        {
            tabRows[i].cells[0].children[1].value = 0;
            tabRows[i].cells[1].innerHTML = "Miembro";
        }
    }
    onInit();
    onChanges();

}

onAdd = ()=>{
    onChanges();
    let row = document.getElementById("TabM").insertRow(1);
    let select = document.getElementById("usuarios");
    let selectData = select.value;
    if (selectData!==''){
        selectData = JSON.parse(selectData);

        let inputId = document.createElement("input");
        inputId.name = "idMiembro";
        inputId.type= "hidden";
        inputId.value = Object.keys(selectData)[0];

        let inputResp = document.createElement("input");
        inputResp.name = "esResp";
        inputResp.type= "hidden";
        inputResp.value = 0;

        let p = document.createElement('p');
        p.innerHTML = Object.values(selectData)[0];

        let r1 = row.insertCell(0);
        row.insertCell(1).innerHTML = "Miembro";
        row.insertCell(2).innerHTML = "";

        r1.appendChild(inputId);
        r1.appendChild(inputResp);
        r1.appendChild(p);

        selectData = select.value;
        for (var i=0; i<select.length; i++) {
            if (select.options[i].value == selectData)
                select.remove(i);
        }
        onInit();
        onChanges();
    }


}

onChanges = ()=>{
    if (apply.disabled ==true)
        apply.disabled = false;
}

onApply = () => {
    let idComite = document.getElementsByName("idComite")[0].value;
    let comite = document.getElementsByName("comite")[0].value;

    let mId = document.getElementsByName("idMiembro");
    let mRes = document.getElementsByName("esResp");
    let miembros = [];

    for (let i = 0; i < mId.length; i++) {
        miembros.push({idUsuario:mId[i].value,esResp:mRes[i].value});    
    }
    axios.post(
        "/comite/editar",
        //"/test",
        {
            idComite:idComite,
            comite:comite,
            miembros:miembros
        }).then((res)=>{
            if (res.status== 200)
                alert("Se aplicaron los cambios satisfactoriamente");
            else
                alert("a ocurrido un error al realizar los cambios codigo:"+res.status);
        });
}

//Setup
document.getElementById("apply").onclick=onApply;
document.getElementById("add").onclick=onAdd;

document.getElementsByName("comite")[0].onchange=()=>{
    if (apply.disabled ==true)
        apply.disabled = false;
}

onInit();