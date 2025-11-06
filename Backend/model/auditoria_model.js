import mongoose from 'mongoose';
const { Schema } = mongoose;

const AuditoriaSchema = new Schema({
  usuarioId: {  //usuario autenticado
    type: String, 
    default: null 
  },      
  anonimoId: {  //usuario no autenticado
    type: String, 
    default: null 
  },      
  accion: {  
    type: String, 
    required: true 
  },
  recurso: { 
    type: String, 
    default: null 
  },         
  recursoId: { 
    type: String, 
    default: null 
  },
  ruta: {     
    type: String, 
    default: null 
  },           
  meta: { 
    type: Schema.Types.Mixed, 
    default: {}
  },  
  creadoEn: { 
    type: Date, 
    default: Date.now 
  }       
}, { versionKey: false });

export const Auditoria = mongoose.model('Auditoria', AuditoriaSchema);