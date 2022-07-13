var obs_text = document.getElementById("obs_new_text");
var obs_submit = document.getElementById("obs_new_post")
var obs_index = document.getElementById("obs_index");

var docData = {
    com:document.getElementById("com").value,
    ses:document.getElementById("ses").value,
    tipo:document.getElementById("tipo").value
}

var Crear,Editar,preEditar,postEdit,Borrar,Index,Refresh;

var Crear =(txtArea)=>{
    body = { //Paramentros de la peticion
        observacion:txtArea.value,
        data:docData
    } 
    axios.post('/observacion', body).then(async (r)=>{ //realizacion de la petición
        if (r.data.msg === 'Ok') //La peticion retorna un objeto ( {msg:'patametro'} )
        {
            obs_text.value='';
            new Control().toast("Observación publicada",1);
            setTimeout(()=>Index(),1000);
        }
        else 
            new Control().ok('Error',r.data.msg);
    }).catch((e)=> {
        console.log(e);
    });
};

var Index = ()=>{//Muestra todas las observaciones de un documento
    let obsNode = undefined;//El elemento div que contendra los demas elementos de las observaciones
    let nombreNode = undefined;//Etiqueta b que contendra el nombre de la persona que lo publico
    let txtNode = undefined;//El contenido de la observacion
    let editNode = undefined;//Boton de editar (en caso de que la observacion sea del mismo usuario que la ve)
    let delNode = undefined;//Boton de eliminar (en caso de que la observacion sea del mismo usuario que la ve)

    axios.get('/observacion/'+docData.com+'/'+docData.ses+'/'+docData.tipo).then((r)=>{
        r = r.data;
        /*La ruta retorna un objeto con el idUsuario y las observaciones guardadas en un arreglo de objetos
        {
            idUsr: idUsuario del solicitante
            obs: [ {idObservacion,observacion,idUsuario,idDocumento},{...},{...}...]
        }
        */
        if (r.obs != undefined){//Si el documento tiene observaciones
            obs_index.innerHTML = "";//Vacia la caja de observaciones

            r.obs.forEach( o => { //Crea un elemento nuevo elemento y lo guarda en cada una de las variables por cada observacion en el documento
                obsNode = document.createElement("div");
                
                nombreNode = document.createElement('b');
                nombreNode.innerHTML = o.nombre+' '+o.apellidoP+' '+o.apellidoM;

                txtNode = document.createElement('p');
                txtNode.innerHTML = o.observacion;

                obsNode.appendChild(nombreNode); //Se inserta el elemento con el nombre y el contenido en el div que guarda toda la observacion
                obsNode.appendChild(txtNode);

                if (o.idUsuario == r.idUsr){ //Si el idUsuario de el comentario es el mismo que el idUsuario del que los visualiza

                    //Se crea un boton delete y se le asigna la funcion Borrar(idObservacion)
                    delNode = document.createElement('button');
                    delNode.textContent = "Borrar";
                    delNode.className = "btn btn-dan mb-2";
                    delNode.onclick = ((x)=>()=>Borrar(x))(o.idObservacion);
                    //Se crea un boton de editar y selle asigna la funcion de preEditar
                    editNode = document.createElement('button');
                    editNode.textContent = "Editar";
                    editNode.className = "btn btn-pri mb-2";
                    editNode.onclick = ((idObs,btnEdit,txtNode,edText,delNode) =>()=>preEditar(idObs,btnEdit,txtNode,edText,delNode))(o.idObservacion,editNode,txtNode,undefined,delNode);

                    //Se añaden los dos botones al div
                    obsNode.appendChild(editNode);
                    obsNode.appendChild(delNode);
                }
                //Se añade el div contenedor de todos los elementos a la caja de comentarios
                obs_index.appendChild(obsNode);
            });
        }
        else
            obs_index.innerHTML = "...";
    });
};

var preEditar = (idObs,btnEdit,txtNode,edText,delNode)=>{
    //Cambia los elementos del div para ponerlos en modo edición
    if (!edText){
        edText = document.createElement("textarea");
        edText.className="form-control";
    }
    delNode.textContent = "Cancelar";
    delNode.onclick = ((idObs,btnEdit,txtNode,edText,delNode) =>()=>{edText.value = txtNode.textContent; postEditar(idObs,btnEdit,txtNode,edText,delNode)})(idObs,btnEdit,txtNode,edText,delNode);
    
    edText.value = txtNode.textContent;    
    txtNode.parentNode.replaceChild(edText,txtNode);

    btnEdit.onclick = ((idObs,edText) =>()=>Editar(idObs,edText))(idObs,edText);
    btnEdit.textContent = "Guardar";
};

var postEditar = (idObs,btnEdit,txtNode,edText,delNode)=>{
    //Cambia los documentos del div para ponerlos en modo de visualización,(se invoca al editar exitosamente, o al cancelar la edicion)
    txtNode.textContent = edText.value;

    delNode.textContent = "Eliminar";
    delNode.onclick=((idObs) =>()=>Borrar(idObs))(idObs);

    edText.parentNode.replaceChild(txtNode,edText);

    btnEdit.onclick = ((idObs,btnEdit,txtNode,edText,delNode) =>()=>preEditar(idObs,btnEdit,txtNode,edText,delNode))(idObs,btnEdit,txtNode,edText,delNode);
    btnEdit.textContent = "Editar";
};

var Editar =(idObs,edText)=>{
    
    let body = {// El cuerpo de la petición
        idObs:idObs,
        txt: edText.value
    }
    axios.put('/observacion',body).then((res)=>{
        if (res.data.msg === 'Ok') //La peticion retorna un objeto ( {msg:'patametro'} )
        {
            Index();
            new Control().toast("Observación modificada",1);

        }
        else 
            new Control.ok("Error",res.data.msg); 
    });
};

var Borrar = async(idObs)=>{
    if ( await new Control().okCancel("Alerta","Esta seguro de que desea eliminar el comentario seleccionado?") ){
        axios.delete("/observacion/"+idObs).then((r)=>{
            if (r.data.msg === 'Ok'){
                Index();
                new Control().toast("Observaciòn borrada exitosamente",1);
            }else{
                new Control.ok("Error",res.data.msg); 
            }
        })
    }
};



obs_submit.onclick = ((x) => ()=>Crear(x) )(obs_text);
setInterval(Index(),10000);
