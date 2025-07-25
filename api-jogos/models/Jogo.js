const mongoose = require('mongoose');

// Schema para guardar a pontuação de cada jogador no ranking
const rankingSchema = new mongoose.Schema({
  jogadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nomeJogador: { type: String, required: true },
  pontuacao: { type: Number, required: true },
  tempo: { type: Number, required: true } // Tempo em segundos
}, {
  _id: false, 
  timestamps: true 
});

const JogoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  termos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Termo', required: true }],
  tipo: { type: String, enum: ['quiz', 'memoria', 'associacao', 'verdadeiroFalso'], required: true }, 
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  criadoEm: { type: Date, default: Date.now },
  codigoAcesso: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  ranking: [rankingSchema]
});


JogoSchema.index({ codigoAcesso: 1 }, { unique: true });

module.exports = mongoose.model('Jogo', JogoSchema);
