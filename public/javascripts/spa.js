
const main = document.getElementById("contenido");
const mp3 = document.getElementById("div_reproductor");
async function cargarPagina(page) {
  if (page !== '/inicio') {
    console.log(page, ";;;;;;;;;;;");
    //se oculta el reproductor mp3
    mp3.classList.remove("mostrar-mp3");
    mp3.classList.add("ocultar-mp3");
    //document.getElementById("div_reproductor").style.display = "none";
    page = "/page" + page;
    const res = await fetch(page);
    console.log("RESPNSE::",res)
    if (res.ok & !res.redirected) {
      const html = await res.text();
      console.log(page)
      main.innerHTML = html;
      if (page == '/page/inicio') {
        //initAudio();
      }
    } else {
      window.location.href = "/";
    }
  } else {
    main.innerHTML = "";
    console.log(page, ";;;;;;;;;;;")
    //document.getElementById("div_reproductor").style.display = "";
    //mostramos el reproductor si este estamos en /inicio
    mp3.classList.add("mostrar-mp3");
    mp3.classList.remove("ocultar-mp3");
  }
}  
cargarPagina('/inicio')