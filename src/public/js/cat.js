(()=>{

    let paramDiv = document.getElementById("paramDiv");
    let pdNormal = paramDiv.innerHTML;
    let pdDate = undefined;
    let sel = document.getElementById('type');



    let onChange = ()=>{
        if (sel.value == '3')
        {
            if (!!pdDate)
                paramDiv.innerHTML = pdDate;
            else
            {
                paramDiv.innerHTML = '';
                let p1,p2;
                let in1,in2;
                let btnS;

                p1 = document.createElement('label');
                p1.innerText = 'Del ';
                p1.className = 'm-2';
                p1.style.fontSize = '1.4vw';

                p2 = document.createElement('label');
                p2.style.fontSize = '1.4vw';
                p2.className = 'm-2';
                p2.innerText = ' al ';
                
                in1 = document.createElement('input');
                in1.type = 'date';
                
                in1.name = 'fi';
                in1.className = 'form-control';

                in2 = document.createElement('input');
                in2.type = 'date';
                in2.name = 'fc';
                in2.className = 'form-control';

                btnS = document.createElement('input');
                btnS.type = 'submit';
                btnS.value = 'Buscar'
                btnS.className = 'btn btn-pri';

                paramDiv.appendChild(p1);
                paramDiv.appendChild(in1);
                paramDiv.appendChild(p2);
                paramDiv.appendChild(in2);
                paramDiv.appendChild(btnS);


                pdDate = paramDiv.innerHTML;

            }
        }
        else{
            paramDiv.innerHTML = pdNormal;
        }
    }

    sel.onchange = onChange;
})()