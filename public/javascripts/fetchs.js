
function fetchPost(url, dataJson, callback) {
    fetch(url, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataJson),
    }).then(respuesta => respuesta.json())
        .then(datos => {
            callback(datos);
        });
}
function addMusicsAdiv(data) {
    console.log("ADDMusicDVI::", data)
    const html_music = `
    <div class="track-list" id="tracks-${data.id}" style="display: flex; align-items: center;margin: 10px;">
            <img src="/images/icon-music.png" height="30" width="30">
            <div class="track" data-src="${data.url}">
              ${data.nombre}
            </div>
          </div>
    `
    document.getElementById('listMusic').innerHTML += html_music;
    //iniciamos nuevamente las eventos del la lista musica
    initAudio();
}
function listoMusic(datos) {
    //limpiamos 
    document.getElementById("nombre").value = "";
    document.getElementById("url").value = "";
    addMusicsAdiv(datos);
}
function listoImg(datos) {
    console.log("Datos desde AddImg:", datos)
    console.log("Agregano datos al select...")
    // 1. Obtener el elemento select
    const selectElement = document.getElementById('selectImg');

    // 2. Crear un nuevo elemento option
    const newOption = document.createElement('option');

    // 3. Establecer el texto y el valor de la nueva opción
    newOption.text = datos.nombre;
    newOption.value = datos.url;

    // 4. Agregar la nueva opción al select
    selectElement.add(newOption);
    console.log("Datos agregados........")
    document.getElementById("nombreImg").value = "";
    document.getElementById("urlImg").value = "";
}
function addMusic() {
    const nombre = document.getElementById("nombre").value;
    const urlDrodpox = document.getElementById("url").value;

    console.log(nombre, urlDrodpox)
    if (urlDrodpox.slice(0, 24) == "https://www.dropbox.com/" && nombre.length > 5) {
        let url_direct = "https://dl.dropboxusercontent.com" + urlDrodpox.slice(23, urlDrodpox.length - 5);
        //addMusicsAdiv(nombre, url_direct);
        const dataJson = {
            nombre: nombre,
            url: url_direct
        };
        fetchPost("/usuarios/addMusic", dataJson, listoMusic);

    }
    else {
        alert("No ur DrobPox");
    }
}
function addImg() {
    const nombre = document.getElementById("nombreImg").value;
    const urlDrodpox = document.getElementById("urlImg").value;
    console.log(nombre, urlDrodpox)
    if (urlDrodpox.slice(0, 24) == "https://www.dropbox.com/" && nombre.length > 1) {
        let url_direct = "https://dl.dropboxusercontent.com" + urlDrodpox.slice(23, urlDrodpox.length - 5);
        const dataJson = {
            nombre: nombre,
            url: url_direct
        };
        fetchPost("/usuarios/addImg", dataJson, listoImg);
    }
    else {
        alert("Nombre corto, o url incorrecta");
    }
}

function msgResp(res) {
    console.log("Eliminada::", res);
}
//-----------Para eliminar imagenes en la base de datos---------------///

function eliminarMusica(id) {
    document.getElementById("tracks-" + id).remove();
    document.getElementById(id).remove();
    const data = {
        id: id
    }
    fetchPost("/usuarios/removeMusic", data, msgResp);
}
//-----------Para eliminar imagenes en la base de datos---------------///

function eliminarImg(id) {
    //Eliminamos la img del select y de la lista de vista
    const selectElement = document.getElementById('selectImg'); // Obtén el elemento select
    const indexAEliminar = id; // Índice de la opción que quieres eliminar (ejemplo) 
    console.log("Eliminada Img. id:", id)
    selectElement.remove(indexAEliminar); // Elimina la opción en el índice 1
    document.getElementById(id).remove();
    //Enviamos el id de la img a eliminar segun el usuario logeado...
    const data = {
        id: id
    }
    fetchPost("/usuarios/removeImg", data, msgResp);
}