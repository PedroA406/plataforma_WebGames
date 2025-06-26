const express = require('express');
const router = express.Router();
const Jogo = require('../models/Jogo');
const authMiddleware = require('../middlewares/authMiddleware');


// ... (código existente no início do arquivo)

// <<-- INÍCIO DO NOVO CÓDIGO -->>
// Rota para listar jogos padrão (público)
router.get('/default', async (req, res) => {
  try {
    const jogos = await Jogo.find({ isDefault: true }).populate('termos');
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar jogos padrão' });
  }
});
// <<-- FIM DO NOVO CÓDIGO -->>


// Rota para pegar jogo pelo código de acesso (sem auth)
// ... (resto do seu código)




// Gera um código único de 6 caracteres
async function gerarCodigoUnico() {
  let codigo;
  let existe = true;

  while (existe) {
    codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    existe = await Jogo.findOne({ codigoAcesso: codigo });
  }

  return codigo;
}

// Criar jogo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, termos, tipo } = req.body;
    if (!nome || !termos || !tipo) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    const codigoAcesso = await gerarCodigoUnico();

    const novoJogo = new Jogo({
      nome,
      termos,
      tipo,
      criadoPor: req.userId,
      codigoAcesso
    });

    await novoJogo.save();
    res.status(201).json(novoJogo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar jogo' });
  }
});

// Rota para pegar jogo pelo código de acesso (sem auth)
router.get('/codigo/:codigoAcesso', async (req, res) => {
  try {
    const jogo = await Jogo.findOne({ codigoAcesso: req.params.codigoAcesso }).populate('termos');
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado pelo código' });
    res.json(jogo);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/publico/:id', async (req, res) => {
  try {
    const jogo = await Jogo.findById(req.params.id).populate('termos');
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(jogo);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar jogo público' });
  }
});

// Rota para pegar um jogo pelo ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const jogo = await Jogo.findById(req.params.id).populate('termos');
    if (!jogo) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(jogo);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



// Listar jogos do usuário autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const jogos = await Jogo.find({ criadoPor: req.userId }).populate('termos');
    res.json(jogos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar jogos' });
  }
});

module.exports = router;
