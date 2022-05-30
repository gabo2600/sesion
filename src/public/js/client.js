function del(id,dir){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", dir+id);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = () => console.log(xhr.responseText);
    let data = {
      "id":id 
    };
    xhr.send(data);
}
  