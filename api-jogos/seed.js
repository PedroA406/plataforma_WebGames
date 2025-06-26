const mongoose = require('mongoose');
const Termo = require('./models/Termo');
const Jogo = require('./models/Jogo');
require('dotenv').config();

// Definição dos nossos 3 jogos padrão
const jogosPadrao = [
    {
        nome: "Quiz: Capitais do Mundo",
        tipo: "quiz",
        termos: [
            { termo: "Brasil", definicao: "Brasília" },
            { termo: "França", definicao: "Paris" },
            { termo: "Japão", definicao: "Tóquio" },
            { termo: "Austrália", definicao: "Camberra" },
            { termo: "Canadá", definicao: "Ottawa" },
            { termo: "Egito", definicao: "Cairo" }
        ]
    },
    {
        nome: "Memória: Animais e seus Sons",
        tipo: "memoria",
        termos: [
            { termo: "Cachorro", definicao: "Au Au" },
            { termo: "Gato", definicao: "Miau" },
            { termo: "Vaca", definicao: "Muuu" },
            { termo: "Pato", definicao: "Quack" }
        ]
    },
    {
        nome: "Associação: Ferramentas e Funções",
        tipo: "associacao",
        termos: [
            { termo: "Martelo", definicao: "Bater pregos" },
            { termo: "Chave de Fenda", definicao: "Apertar parafusos" },
            { termo: "Serrote", definicao: "Cortar madeira" },
            { termo: "Trena", definicao: "Medir distâncias" }
        ]
    }
];

// Gera um código de acesso único
async function gerarCodigoUnico() {
    let codigo;
    let existe = true;
    while (existe) {
        codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        existe = await Jogo.findOne({ codigoAcesso: codigo });
    }
    return codigo;
}

// Função principal do Seeder
async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🟢 Conectado ao MongoDB para o seeding.");

        // Para cada jogo padrão que definimos...
        for (const jogoData of jogosPadrao) {
            
            // 1. Verifica se o jogo já existe pelo nome
            const jogoExistente = await Jogo.findOne({ nome: jogoData.nome, isDefault: true });
            if (jogoExistente) {
                console.log(`🟡 Jogo "${jogoData.nome}" já existe. Pulando.`);
                continue;
            }

            // 2. Cria os termos no banco de dados
            const termosCriados = await Termo.insertMany(jogoData.termos.map(t => ({...t, criadoPor: null})));
            const idsDosTermos = termosCriados.map(t => t._id);

            // 3. Cria o jogo com os IDs dos termos
            const novoJogo = new Jogo({
                nome: jogoData.nome,
                tipo: jogoData.tipo,
                termos: idsDosTermos,
                isDefault: true,
                codigoAcesso: await gerarCodigoUnico()
            });

            await novoJogo.save();
            console.log(`✅ Jogo "${jogoData.nome}" criado com sucesso!`);
        }

    } catch (error) {
        console.error("🔴 Erro ao popular o banco de dados:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔵 Desconectado do MongoDB.");
    }
}

seedDatabase();