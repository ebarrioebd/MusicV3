// routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/userController');

function isAutenticate(req, res, next) {
  if(req.session.usuario) {
    //console.log(req.session.usuario)
    next();
  } else {
    res.render("login");
  } 
}
function isAutenticateLogin(req, res, next) {
  //console.log("Autenticate data : ",req.body)
  if(req.session.usuario) {
    //console.log(req.session.usuario)
    res.redirect('/inicio');
  } else {
    next();
  } 
}
function isAutenticateRegister(req,res,next){
   if(req.session.usuario) {
    res.redirect('/inicio');
  } else {
    next();
  } 
}
router.post('/register',isAutenticateRegister, usuariosController.crearUsuario); 
router.post('/login',isAutenticateLogin, usuariosController.obtenerUsuarioPorEmail); 

router.post('/addMusic',isAutenticate,usuariosController.addMusic);
router.post('/removeMusic',isAutenticate,usuariosController.removeMusic)

router.post('/addImg',isAutenticate,usuariosController.addImg);
router.post('/removeImg',isAutenticate,usuariosController.removeImg);

router.post('/saveConfig',isAutenticate,usuariosController.actualizarConfig);
module.exports = router;

