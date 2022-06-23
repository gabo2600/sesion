var obs_text = document.getElementById("obs_new_text");
var obs_submit = document.getElementById("obs_new_post");
var obs_index = document.getElementById("obs_index");

var docData = {
    com:document.getElementById("com").value,
    ses:document.getElementById("ses").value,
    tipo:document.getElementById("tipo").value
}


var Crear =(txtArea)=>{
    body = {
        observacion:txtArea.value,
        data:docData
    }
    axios.post('/observacion', body).then((r)=>{
        console.log(r.data );  
    }).catch((e)=> {
        console.log(e);
    });
};


var Editar = async()=>{};
var Index = async()=>{};
var Borrar = async()=>{};




obs_submit.onclick = ((x) => ()=>Crear(x) )(obs_text);
Index();