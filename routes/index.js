var express = require('express');
var router = express.Router();
//-------Autenticas--------//

function isAutenticate(req, res, next) { 
  console.log("estas Autenticado ? ...:")
  if (req.session.usuario) {
  console.log("Si estas...:")
    //console.log(req.session.usuario)
    next();
  } else {
    console.log("No estas...:")
    res.redirect('/login');
  }
}
/* GET home page. */  
router.get("/",isAutenticate, (req, res) => { 
  
  res.render("index",req.session.usuario);
});

router.get("/login", (req, res) => {
  res.render('login')
});
router.get("/register", (req, res) => {
  res.render('register');
}); 

router.get("/page/addMusic",isAutenticate, (req, res) => {
  console.log("addMusic............");
  res.render(`partials/addMusic`, { imagenes: req.session.usuario.imagenes }, (err, html) => {
    console.log(err)
    if (err) {
      return res.send("Página no encontrada" + err);
    }
    res.send(html);
  });
}); 
router.get("/page/ver_imagenes",isAutenticate, (req, res) => {
  console.log("ver_imagenes............");
  res.render(`partials/ver_imagenes`, { imagenes: req.session.usuario.imagenes }, (err, html) => {
    console.log(err)
    if (err) {
      return res.send("Página no encontrada" + err);
    }
    res.send(html);
  });
}); 
router.get("/page/ver_musicas",isAutenticate, (req, res) => {
  console.log("ver_musicas............");
  res.render(`partials/ver_musicas`, {musics: req.session.usuario.musics}, (err, html) => {
    console.log(err)
    if (err) {
      return res.send("Página no encontrada" + err);
    }
    res.send(html);
  });
}); 
router.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect('/login');
})
module.exports = router;
