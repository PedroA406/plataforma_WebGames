const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
});

// Antes de salvar, hash da senha (se alterada)
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

// Método para comparar senha
userSchema.methods.compararSenha = function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', userSchema);
