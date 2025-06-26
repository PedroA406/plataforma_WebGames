const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Pega o token do cabeçalho Authorization (no formato "Bearer <token>")
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer <token>" -> pega só o token

  if (!token) {
    return res.status(401).json({ erro: 'Token inválido' });
  }

  try {
    // Verifica o token com a chave secreta que você definiu no .env (JWT_SECRE)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Salva o id do usuário decodificado na requisição para usar nas rotas protegidas
    req.userId = decoded.id;

    next(); // passa para o próximo middleware/handler
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};
