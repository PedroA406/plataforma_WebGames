const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ erro: 'E-mail já cadastrado.' });

    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro no cadastro.' });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
    try {
      const { email, senha } = req.body;
      const usuario = await User.findOne({ email });
      if (!usuario) return res.status(400).json({ erro: 'Usuário não encontrado.' });
  
      const senhaCorreta = await usuario.compararSenha(senha);
      if (!senhaCorreta) return res.status(401).json({ erro: 'Senha inválida.' });
  
      const token = jwt.sign(
        { id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
  
      res.json({ token, nome: usuario.nome });
    } catch (err) {
      console.error('Erro no login:', err);  // <-- Adicione essa linha para ver o erro no console
      res.status(500).json({ erro: 'Erro no login.' });
    }
  });
  

module.exports = router;
