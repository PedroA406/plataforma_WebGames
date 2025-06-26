const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API da Plataforma de Jogos no ar!');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const termoRoutes = require('./routes/termos');
app.use('/api/termos', termoRoutes);

const jogoRoutes = require('./routes/jogos');
app.use('/api/jogos', jogoRoutes);

const userRoutes = require('./routes/user'); // Importa a nova rota
app.use('/api/user', userRoutes);


// ✅ Conexão ao MongoDB (sem opções obsoletas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('🟢 Conectado ao MongoDB');
    app.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT || 3000}`)
    );
  })
  .catch(err => {
    console.error('🔴 Erro ao conectar ao MongoDB:', err);
  });
