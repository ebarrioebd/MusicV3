
const blurBD = "<%= blur %>";
const imgFondoBD ="<%= imagen_fondo %>";
const config_inicio = {
    blur: localStorage.getItem("blur") !== null ? localStorage.getItem("blur") : "10",
    //blur: localStorage.getItem("blur") !== null ? localStorage.getItem("blur") : "10",
    imgFondo: localStorage.getItem("imagen_fondo") !== "" ? localStorage.getItem("imagen_fondo") : `radial-gradient(40vmax 40vmax at 15% 20%, var(--accent), transparent 60%),
    radial-gradient(35vmax 35vmax at 85% 30%, var(--accent-2), transparent 55%),
    radial-gradient(45vmax 45vmax at 60% 85%, #f59e0b, transparent 60%);`
}
const bg_decor = document.getElementById('bg-decor');
const urlImg = document.getElementById("selectImg");
const rangeBlur = document.getElementById('rangeBlur');

function actualizarConfig() { 
    //console.log(" localStorage.getItem(imagen_fondo)", localStorage.getItem("imagen_fondo"))
    bg_decor.style = `
        filter:blur(${config_inicio.blur}px);
        background-image:url('${config_inicio.imgFondo}');
        inset:0px; 
        background-size: cover;
        background-position: center
        `;
}
function setFondo() {
    config_inicio.imgFondo = urlImg.value;
    actualizarConfig();
}

rangeBlur.addEventListener('input', (event) => {
    console.log("Blur:", event.target.value);
    config_inicio.blur = event.target.value;
    actualizarConfig();
});

actualizarConfig();

//Funciones para mostrar ventanas flotantes

let isShowConfig = false;
function mostrarConfig() {
    document.getElementById("config-inicio").classList.remove("ocultarIni");
    if (isShowConfig) {
        document.getElementById("config-inicio").classList.remove("mostrarConfig");
        document.getElementById("config-inicio").classList.add("ocultarConfig");
    } else {
        document.getElementById("config-inicio").classList.add("mostrarConfig");
        document.getElementById("config-inicio").classList.remove("ocultarConfig");
    }
    isShowConfig = !isShowConfig;
}
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
function resData(dat) {
    console.log(dat)
}
function guardarConfig() {
    console.log("Guradando datos en LocalStorage ...")
    console.log("blur:", config_inicio.blur);
    console.log("imagen_fondo:", config_inicio.imgFondo);
    localStorage.setItem("blur", config_inicio.blur);
    localStorage.setItem("imagen_fondo", config_inicio.imgFondo);
    fetchPost("/usuarios/saveConfig", config_inicio, resData);
}