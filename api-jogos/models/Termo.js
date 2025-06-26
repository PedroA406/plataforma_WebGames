const mongoose = require('mongoose');

const termoSchema = new mongoose.Schema({
  termo: { type: String, required: true },
  definicao: { type: String, required: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 'required: true' foi removido
}, {
  timestamps: true,
});

module.exports = mongoose.model('Termo', termoSchema);
