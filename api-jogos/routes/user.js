const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// ROTA PARA BUSCAR DADOS DO PERFIL DO USUÁRIO LOGADO
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Busca o usuário pelo ID que está no token, sem retornar a senha
    const user = await User.findById(req.userId).select('-senha');
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados do usuário.' });
  }
});

// ROTA PARA ALTERAR A SENHA
router.put('/change-password', authMiddleware, async (req, res) => {
  const { senhaAntiga, novaSenha } = req.body;

  // Validação básica
  if (!senhaAntiga || !novaSenha) {
    return res.status(400).json({ erro: 'Por favor, forneça a senha antiga e a nova senha.' });
  }

  try {
    // Busca o usuário completo (incluindo a senha)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // Compara a senha antiga fornecida com a que está no banco
    const senhaCorreta = await user.compararSenha(senhaAntiga);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'A senha antiga está incorreta.' });
    }

    // Atribui a nova senha. O hook 'pre-save' no model User.js vai cuidar de fazer o hash.
    user.senha = novaSenha;
    await user.save();

    res.json({ mensagem: 'Senha alterada com sucesso!' });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao alterar a senha.' });
  }
});

// Adicione esta rota no arquivo /routes/user.js

// ROTA PARA ATUALIZAR INFORMAÇÕES DO PERFIL (NOME E EMAIL)
router.put('/me', authMiddleware, async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
  }

  try {
    // Verifica se o novo e-mail já está sendo usado por OUTRO usuário
    const emailEmUso = await User.findOne({ email: email, _id: { $ne: req.userId } });
    if (emailEmUso) {
      return res.status(400).json({ erro: 'Este e-mail já está em uso por outra conta.' });
    }

    // Encontra e atualiza o usuário
    const usuarioAtualizado = await User.findByIdAndUpdate(
      req.userId,
      { nome, email },
      { new: true, runValidators: true } // 'new: true' retorna o documento atualizado
    ).select('-senha'); // Nunca retorna a senha

    if (!usuarioAtualizado) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    
    res.json(usuarioAtualizado);

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar o perfil.' });
  }
});

module.exports = router;