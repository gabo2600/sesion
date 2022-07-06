( ()=>{

var fi = document.getElementById("fi"); //Fecha de inicio de la sesion
var fc = document.getElementById("fc"); //Fecha de cierre de la sesion
var btnMostrar = document.getElementById("mostrar"); //Boton para mostrar la tabla de documentos en interfaz de editar
var tab = document.getElementById("tab"); //tabla de los documentos

//Inputs de los pdfs
let conv = document.getElementsByName("convocatoria")[0]; 
let carp = document.getElementsByName("carpeta_de_trabajo")[0];
let actf = document.getElementsByName("acta_preliminar")[0];
let actp = document.getElementsByName("acta_final")[0];


let onChangeFi = ()=>{ //Si cambia la fecha de inicio
    if (fc.min!='')
        fc.min = fi.value;
}

let onChangeFc = ()=>{ //Si cambia la fecha de cierre
    if (fc.max!='')
        fi.max = fc.value;
}

let mostrar = ()=>{ //Muestra la tabla de documentos
    tab.style.display = "block";
    btnMostrar.innerText = "Ocultar"
    btnMostrar.onclick = ocultar;
}

let ocultar = ()=>{ //Oculta la tabla de documentos
    tab.style.display = "none";
    btnMostrar.innerText = "Mostrar"
    btnMostrar.onclick = mostrar;
}

function val(input) { //Valida el peso de los archivos
    const fileSize = input.files[0].size / 1024 / 1024; // peso en MB
    const max = 4;

    if (fileSize > max) { //Si pesa mas de 2
      alert('El archivo pesa mas de '+max+' Mb');
      input.files[0] = undefined;
      input.value = '';
    }
}

fi.onchange = onChangeFi;
fc.onchange = onChangeFc;
if (!!btnMostrar)
    btnMostrar.onclick = mostrar;

conv.onchange = ((x)=>()=>val(x))(conv);
carp.onchange = ((x)=>()=>val(x))(carp);
actf.onchange = ((x)=>()=>val(x))(actf);
actp.onchange = ((x)=>()=>val(x))(actp);

})();
