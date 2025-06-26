const express = require('express');
const Termo = require('../models/Termo');
const authMiddleware = require('../middlewares/authMiddleware'); // para proteger rotas
const router = express.Router();

// Criar termo (autenticado)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { termo, definicao } = req.body;
    const novoTermo = new Termo({
      termo,
      definicao,
      criadoPor: req.userId,  // id do usuário do token
    });
    await novoTermo.save();
    res.status(201).json(novoTermo);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar termo' });
  }
});

// Listar termos do usuário autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const termos = await Termo.find({ criadoPor: req.userId });
    res.json(termos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar termos' });
  }
});

// Atualizar termo pelo ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { termo, definicao } = req.body;
    const termoAtualizado = await Termo.findOneAndUpdate(
      { _id: req.params.id, criadoPor: req.userId },
      { termo, definicao },
      { new: true }
    );
    if (!termoAtualizado) return res.status(404).json({ erro: 'Termo não encontrado' });
    res.json(termoAtualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar termo' });
  }
});

// Deletar termo pelo ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const termoDeletado = await Termo.findOneAndDelete({ _id: req.params.id, criadoPor: req.userId });
    if (!termoDeletado) return res.status(404).json({ erro: 'Termo não encontrado' });
    res.json({ mensagem: 'Termo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar termo' });
  }
});

module.exports = router;
