const mongoose = require('mongoose');

const JogoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  termos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Termo', required: true }],
  tipo: { type: String, enum: ['quiz', 'memoria', 'associacao'], required: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Remova o 'required: true'
  criadoEm: { type: Date, default: Date.now },
  codigoAcesso: { type: String, required: true }, // 'unique: true' foi removido daqui
  isDefault: { type: Boolean, default: false }
});

// ✅ Aqui é onde criamos o índice corretamente
JogoSchema.index({ codigoAcesso: 1 }, { unique: true });

module.exports = mongoose.model('Jogo', JogoSchema);
