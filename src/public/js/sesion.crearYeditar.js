
var fi = document.getElementById("fi");
var fc = document.getElementById("fc");

let onChangeFi = ()=>{
    if (fc.min!='')
        fc.min = fi.value;
}

let onChangeFc = ()=>{
    if (fc.max!='')
        fi.max = fc.value;
}

fi.onchange = onChangeFi;
fc.onchange = onChangeFc;