const Usuario = require('../models/Usuario');
const Proyectos = require("../models/Proyecto");
const bcrypyjs = require('bcryptjs');
const {validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');


exports.crearUsuario = async  (req,res) => {
  //revisar si hay errores
  const errores = validationResult(req);
  if(!errores.isEmpty()){
    return res.status(400).json({errores: errores.array()})
  }
    //extraer email y password
    const { email,password } = req.body;


    try {
        //revisar que el usuario sea unico
          let usuario = await Usuario.findOne({ email });
          if(usuario){
            return res
              .status(400)
              .json({ msg: "El usuario ingreso un email repetido" });
          }
        
          usuario = new Usuario(req.body);

          //hash password
          const salt =  await bcrypyjs.genSalt(15);
          usuario.password = await bcrypyjs.hash(password, salt);
          
          //guardar el nuevo usuario
          await usuario.save();
          //creay y firmar token
          const payload = {
            usuario:{
              id: usuario.id
            }
          };
          jwt.sign(payload, process.env.SECRETA,{
            expiresIn: 3600
          },(error,token)=>{
              if(error)
                         throw error;
                         //Mensaje de confirmacion
                         res.status(200).json({ token });
                       
          } );

          
        } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
}

