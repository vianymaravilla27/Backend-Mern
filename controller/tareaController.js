const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const {validationResult} = require('express-validator');
//Crea una nueva Tarea
exports.crearTarea = async (req, res) => {
    // Revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({errores: errores.array() })
    }
    //extraer el proyecto y comprobar si existe
   
    try {
        const { proyecto } = req.body;
        const existeproyecto = await Proyecto.findById(proyecto);
        if (!existeproyecto) {
          return res.status(404).json({ msg: "Proyecto no encontrado" });
        }
        //Revisar si el proyecto actual pertenece al usuario autenticado
        if (existeproyecto.creador.toString() !== req.usuario.id) {
          return res.status(401).json({ msg: "No Autorizado" });
        }
        //crear la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json ({tarea});

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }

}

//obtiene las tareas por proyecto 

exports.obtenerTareas = async(req,res)=>{

 try {
   const { proyecto } = req.query;
  
   const existeproyecto = await Proyecto.findById(proyecto);
   if (!existeproyecto) {
     return res.status(404).json({ msg: "Proyecto no encontrado" });
   }
   //Revisar si el proyecto actual pertenece al usuario autenticado
   if (existeproyecto.creador.toString() !== req.usuario.id) {
     return res.status(401).json({ msg: "No Autorizado" });
   }

   //Obtener tareas por proyecto
   const tareas = await Tarea.find({proyecto}).sort({creado: -1});
   res.json({tareas});
 } catch (error) {
   console.log(error);
   res.status(500).send('Hubo un error');
 }

}

//Actualizar una tarea

exports.actualizarTarea = async (req,res) =>{
  try {
        const { proyecto, nombre, estado } = req.body;

        //revisar si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);
        if (!tarea) {
          return res.status(404).json({ msg: "No Existe la tarea" });
        }
        //extraer proyecto
        const existeproyecto = await Proyecto.findById(proyecto);

        //Revisar si el proyecto actual pertenece al usuario autenticado
        if (existeproyecto.creador.toString() !== req.usuario.id) {
          return res.status(401).json({ msg: "No Autorizado" });
        }

        //crear un objeto con la nueva informacion

        const nuevaTarea = {};
        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;

        //guardar la tarea

        tarea = await Tarea.findOneAndUpdate({_id : req.params.id}, nuevaTarea, {new: true});
        res.json({tarea});
      } catch (error) {console.log(error);
    
        res.status(500).send("Hubo un error");
  }
}

//se elimina una tarea
exports.eliminarTarea = async (req,res) =>{

   try {
     const { proyecto } = req.query;

     //revisar si la tarea existe o no
     let tarea = await Tarea.findById(req.params.id);
     if (!tarea) {
       return res.status(404).json({ msg: "No Existe la tarea" });
     }
     //extraer proyecto
     const existeproyecto = await Proyecto.findById(proyecto);

     //Revisar si el proyecto actual pertenece al usuario autenticado
     if (existeproyecto.creador.toString() !== req.usuario.id) {
       return res.status(401).json({ msg: "No Autorizado" });
     }

    //Eliminar 
    await Tarea.findOneAndRemove({_id: req.params.id});
    res.json({msg: 'Tarea Eliminada'})
   } catch (error) {
     console.log(error);

     res.status(500).send("Hubo un error");
   }

}