const Proyeto = require('../models/Proyecto');
const {validationResult} = require('express-validator');
const Proyecto = require('../models/Proyecto');

exports.crearProyecto = async  (req,res) => {
    //revisar si hay errores
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({ errores: errores.array() });
    }
    try {
        const proyecto = new Proyeto(req.body);
        //Guardar el creador via JWT
        proyecto.creador = req.usuario.id;
        //guardar el proyecto
        proyecto.save();
        res.json(proyecto);

    } catch (error) {
        console.log('error');
        res.status(500).send('Hubo un error');
    }
}

//obtiene todos los proyextos del usuario actual

exports.obtenerProyectos = async (req,res) =>{
    try {
        const proyectos = await Proyecto.find({creador: req.usuario.id}).sort({creado: -1});
        res.json({proyectos})
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}
// Actualiza un proyecto
exports.actualizarProyectos = async (req, res) => {

    // Revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ) {
        return res.status(400).json({errores: errores.array() })
    }

    // extraer la información del proyecto
    const { nombre } = req.body;
    const nuevoProyecto = {};
    
    if(nombre) {
        nuevoProyecto.nombre = nombre;
    }

    try {

        // revisar el ID 
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto existe o no
        if(!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }

        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id ) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // actualizar
        proyecto = await Proyecto.findByIdAndUpdate({ _id: req.params.id }, { $set : nuevoProyecto}, { new: true });

        res.json({proyecto});

    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor');
    }
}

// Elimina un proyecto por su id
exports.eliminarProyecto = async (req, res ) => {
    try {
        // revisar el ID 
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto existe o no
        if(!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }

        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id ) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // Eliminar el Proyecto
        await Proyecto.findOneAndRemove({ _id : req.params.id });
        res.json({ msg: 'Proyecto eliminado '})

    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor')
    }
}