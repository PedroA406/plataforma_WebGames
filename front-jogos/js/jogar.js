(async function () {
    // Pega o id do jogo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const jogoId = urlParams.get('id');

    // -->> Esta parte foi atualizada para buscar da rota pública <<--
    // const token = localStorage.getItem('token'); // Não precisa mais do token aqui

    const tituloJogo = document.getElementById('tituloJogo');
    const areaJogo = document.getElementById('areaJogo');

    // Elementos Quiz
    const jogoQuizEl = document.getElementById('jogoQuiz');
    const perguntaQuizEl = document.getElementById('perguntaQuiz');
    const respostasQuizEl = document.getElementById('respostasQuiz');
    const btnProximoQuiz = document.getElementById('btnProximoQuiz');
    const resultadoFinalQuiz = document.getElementById('resultadoFinalQuiz');
    const acertosQuizEl = document.getElementById('acertosQuiz');
    const totalPerguntasQuizEl = document.getElementById('totalPerguntasQuiz');
    const botoesFinalQuiz = document.getElementById('botoesFinalQuiz');
    const btnJogarNovamenteQuiz = document.getElementById('btnJogarNovamenteQuiz');
    const btnMeusJogosQuiz = document.getElementById('btnMeusJogosQuiz');

    // Elementos Memória
    const jogoMemoriaEl = document.getElementById('jogoMemoria');
    const memoriaGridEl = document.getElementById('memoriaGrid');
    const resultadoMemoriaEl = document.getElementById('resultadoMemoria');
    const btnJogarNovamenteMemoria = document.getElementById('btnJogarNovamenteMemoria');
    const btnMeusJogosMemoria = document.getElementById('btnMeusJogosMemoria');

    // Elementos Associação
    const jogoAssociacaoEl = document.getElementById('jogoAssociacao');
    const colunaTermosEl = document.getElementById('colunaTermos');
    const colunaDefinicoesEl = document.getElementById('colunaDefinicoes');
    const btnVerificarAssociacao = document.getElementById('btnVerificarAssociacao');
    const resultadoAssociacaoEl = document.getElementById('resultadoAssociacao');
    const acertosAssociacaoEl = document.getElementById('acertosAssociacao');
    const totalParesAssociacaoEl = document.getElementById('totalParesAssociacao');
    const botoesFinalAssociacao = document.getElementById('botoesFinalAssociacao');
    const btnJogarNovamenteAssociacao = document.getElementById('btnJogarNovamenteAssociacao');
    const btnMeusJogosAssociacao = document.getElementById('btnMeusJogosAssociacao');

    // --- Carregamento dos Efeitos Sonoros --- // <-- SOM ADICIONADO
    // --- Carregamento dos Efeitos Sonoros ---
    const somClick = new Audio('sounds/click.mp3');
    const somAcerto = new Audio('sounds/acerto.mp3');
    const somErro = new Audio('sounds/erro.mp3');
    const somFinal = new Audio('sounds/final.mp3');

    // Função auxiliar para tocar os sons // <-- SOM ADICIONADO
    function tocarSom(som) {
        const somClone = som.cloneNode(); // Clona para permitir tocar várias vezes
        somClone.play();
    }

    // Variáveis de controle dos jogos
    let termosDoJogo = [];
    let indiceQuiz = 0;
    let acertosQuiz = 0;
    let cardsMemoria = [];
    let cardsVirados = [];
    let paresEncontrados = 0;
    let bloqueadoMemoria = false;
    let termosAssociacao = [];
    let definicoesAssociacao = [];
    let arrastado = null;
    let associacoesCorretas = 0;

    // -->> Esta validação de token foi removida para permitir acesso público <<--

    if (!jogoId) {
        areaJogo.innerHTML = '<p>ID do jogo não fornecido.</p>';
        tituloJogo.textContent = 'Erro';
        return;
    }

    // Função para mostrar apenas a área do tipo do jogo
    function mostrarSecaoJogo(tipoJogo) {
        document.querySelectorAll('.jogo-tipo').forEach(el => el.style.display = 'none');
        switch (tipoJogo) {
            case 'quiz':
                jogoQuizEl.style.display = 'block';
                break;
            case 'memoria':
                jogoMemoriaEl.style.display = 'block';
                break;
            case 'associacao':
                jogoAssociacaoEl.style.display = 'block';
                break;
            default:
                areaJogo.innerHTML = `<p>Tipo de jogo desconhecido: ${tipoJogo}</p>`;
        }
    }



    // Carregar dados do jogo da API
    async function carregarJogo() {
        try {
            // -->> Rota atualizada para a pública <<--
            const res = await fetch(`http://localhost:3000/api/jogos/publico/${jogoId}`);
            if (!res.ok) throw new Error('Erro ao carregar jogo');
            const jogo = await res.json();

            tituloJogo.textContent = jogo.nome;
            termosDoJogo = jogo.termos || [];

            if (termosDoJogo.length === 0) {
                areaJogo.innerHTML = '<p>Este jogo não possui termos cadastrados.</p>';
                return;
            }

            mostrarSecaoJogo(jogo.tipo);

            switch (jogo.tipo) {
                case 'quiz': iniciarQuiz(); break;
                case 'memoria': iniciarMemoria(); break;
                case 'associacao': iniciarAssociacao(); break;
                default:
                    areaJogo.innerHTML = `<p>Tipo de jogo "${jogo.tipo}" não suportado.</p>`;
            }
        } catch (error) {
            console.error(error);
            tituloJogo.textContent = 'Erro ao carregar jogo';
            areaJogo.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }
    }

    // ================== QUIZ ====================
    function iniciarQuiz() {
        indiceQuiz = 0;
        acertosQuiz = 0;
        perguntaQuizEl.style.display = 'block';
        respostasQuizEl.style.display = 'block';
        resultadoFinalQuiz.style.display = 'none';
        botoesFinalQuiz.style.display = 'none';

        mostrarPerguntaQuiz();

        btnProximoQuiz.onclick = () => {
            tocarSom(somClick); // <-- SOM ADICIONADO
            indiceQuiz++;
            if (indiceQuiz < termosDoJogo.length) {
                mostrarPerguntaQuiz();
            } else {
                finalizarQuiz();
            }
        };

        btnJogarNovamenteQuiz.onclick = () => iniciarQuiz();
        btnMeusJogosQuiz.onclick = () => window.location.href = 'meus-jogos.html';
    }

    function mostrarPerguntaQuiz() {
        if (termosDoJogo.length === 0) {
            perguntaQuizEl.textContent = 'Nenhum termo para o quiz.';
            respostasQuizEl.innerHTML = '';
            btnProximoQuiz.style.display = 'none';
            return;
        }

        const termoAtual = termosDoJogo[indiceQuiz];
        perguntaQuizEl.textContent = `Qual a definição de "${termoAtual.termo}"?`;
        respostasQuizEl.innerHTML = '';

        let opcoes = [termoAtual.definicao];
        const outrasDefinicoes = termosDoJogo
            .filter(t => t._id !== termoAtual._id)
            .map(t => t.definicao);

        while (opcoes.length < Math.min(4, termosDoJogo.length) && outrasDefinicoes.length > 0) {
            const randomIndex = Math.floor(Math.random() * outrasDefinicoes.length);
            const randomDefinicao = outrasDefinicoes.splice(randomIndex, 1)[0];
            if (!opcoes.includes(randomDefinicao)) {
                opcoes.push(randomDefinicao);
            }
        }

        opcoes.sort(() => Math.random() - 0.5);

        opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.classList.add('resposta-btn');
            btn.textContent = opcao;
            btn.onclick = () => {
                tocarSom(somClick); // <-- SOM ADICIONADO
                if (opcao === termoAtual.definicao) {
                    tocarSom(somAcerto); // <-- SOM ADICIONADO
                    btn.classList.add('correta');
                    acertosQuiz++;
                } else {
                    tocarSom(somErro); // <-- SOM ADICIONADO
                    btn.classList.add('errada');
                    [...respostasQuizEl.children].forEach(b => {
                        if (b.textContent === termoAtual.definicao) b.classList.add('correta');
                    });
                }
                [...respostasQuizEl.children].forEach(b => b.disabled = true);
                btnProximoQuiz.style.display = 'inline-block';
                btnProximoQuiz.focus();
            };
            respostasQuizEl.appendChild(btn);
        });

        btnProximoQuiz.style.display = 'none';
        perguntaQuizEl.focus();
    }

    function finalizarQuiz() {
        tocarSom(somFinal); // <-- SOM ADICIONADO
        perguntaQuizEl.style.display = 'none';
        respostasQuizEl.style.display = 'none';
        btnProximoQuiz.style.display = 'none';

        acertosQuizEl.textContent = acertosQuiz;
        totalPerguntasQuizEl.textContent = termosDoJogo.length;
        resultadoFinalQuiz.style.display = 'block';
        botoesFinalQuiz.style.display = 'flex';
        resultadoFinalQuiz.focus();
    }

    // ================== MEMÓRIA ====================
    function iniciarMemoria() {
        memoriaGridEl.innerHTML = '';
        cardsVirados = [];
        paresEncontrados = 0;
        bloqueadoMemoria = false;
        resultadoMemoriaEl.style.display = 'none';
        memoriaGridEl.style.display = 'grid';

        cardsMemoria = [];
        termosDoJogo.forEach(termo => {
            cardsMemoria.push({ id: termo._id, tipo: 'termo', conteudo: termo.termo, virado: false, encontrado: false });
            cardsMemoria.push({ id: termo._id, tipo: 'definicao', conteudo: termo.definicao, virado: false, encontrado: false });
        });

        cardsMemoria.sort(() => Math.random() - 0.5);

        cardsMemoria.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('memoria-card');
            cardEl.dataset.index = index;
            cardEl.innerHTML = `
                <div class="memoria-card-frente"></div>
                <div class="memoria-card-verso">${card.conteudo}</div>
            `;
            cardEl.addEventListener('click', () => virarCard(cardEl, card));
            memoriaGridEl.appendChild(cardEl);
        });

        btnJogarNovamenteMemoria.onclick = iniciarMemoria;
        btnMeusJogosMemoria.onclick = () => window.location.href = 'meus-jogos.html';
    }

    function virarCard(cardEl, cardData) {
        tocarSom(somClick); // <-- SOM ADICIONADO
        if (bloqueadoMemoria || cardData.virado || cardData.encontrado) return;

        cardEl.classList.add('virado');
        cardData.virado = true;
        cardsVirados.push({ el: cardEl, data: cardData });

        if (cardsVirados.length === 2) {
            bloqueadoMemoria = true;
            setTimeout(verificarParMemoria, 1000);
        }
    }

    function verificarParMemoria() {
        const [card1, card2] = cardsVirados;

        if (card1.data.id === card2.data.id) {
            tocarSom(somAcerto); // <-- SOM ADICIONADO
            card1.el.classList.add('encontrado');
            card2.el.classList.add('encontrado');
            card1.data.encontrado = true;
            card2.data.encontrado = true;
            paresEncontrados++;

            if (paresEncontrados === termosDoJogo.length) {
                setTimeout(finalizarMemoria, 500);
            }
        } else {
            tocarSom(somErro); // <-- SOM ADICIONADO
            card1.el.classList.remove('virado');
            card2.el.classList.remove('virado');
            card1.data.virado = false;
            card2.data.virado = false;
        }

        cardsVirados = [];
        bloqueadoMemoria = false;
    }

    function finalizarMemoria() {
        tocarSom(somFinal); // <-- SOM ADICIONADO
        memoriaGridEl.style.display = 'none';
        resultadoMemoriaEl.style.display = 'block';
        resultadoMemoriaEl.focus();
    }

    // ================== ASSOCIAÇÃO ====================
    function iniciarAssociacao() {
        colunaTermosEl.innerHTML = '<h3>Termos</h3>';
        colunaDefinicoesEl.innerHTML = '<h3>Definições</h3>';
        associacoesCorretas = 0;
        btnVerificarAssociacao.style.display = 'inline-block';
        resultadoAssociacaoEl.style.display = 'none';
        botoesFinalAssociacao.style.display = 'none';

        termosAssociacao = termosDoJogo.map(t => ({ _id: t._id, termo: t.termo }));
        definicoesAssociacao = termosDoJogo.map(t => ({ _id: t._id, definicao: t.definicao }));

        termosAssociacao.sort(() => Math.random() - 0.5);
        definicoesAssociacao.sort(() => Math.random() - 0.5);

        termosAssociacao.forEach(t => {
            const termoEl = document.createElement('div');
            termoEl.classList.add('associacao-item', 'termo');
            termoEl.dataset.id = t._id;
            termoEl.textContent = t.termo;
            colunaTermosEl.appendChild(termoEl);
        });

        definicoesAssociacao.forEach(d => {
            const defEl = document.createElement('div');
            defEl.classList.add('associacao-item', 'definicao');
            defEl.dataset.id = d._id;
            defEl.textContent = d.definicao;
            defEl.setAttribute('draggable', true);
            defEl.addEventListener('dragstart', handleDragStart);
            defEl.addEventListener('dragend', handleDragEnd);
            colunaDefinicoesEl.appendChild(defEl);
        });

        colunaTermosEl.addEventListener('dragover', handleDragOver);
        colunaTermosEl.addEventListener('drop', handleDrop);
        colunaDefinicoesEl.addEventListener('dragover', handleDragOver);
        colunaDefinicoesEl.addEventListener('drop', handleDrop);

        btnVerificarAssociacao.onclick = () => {
            tocarSom(somClick); // <-- SOM ADICIONADO
            verificarAssociacao();
        };
        btnJogarNovamenteAssociacao.onclick = iniciarAssociacao;
        btnMeusJogosAssociacao.onclick = () => window.location.href = 'meus-jogos.html';
    }

    function handleDragStart(e) {
        arrastado = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', arrastado.dataset.id);
        arrastado.classList.add('arrastando');
    }

    function handleDragEnd(e) {
        if (arrastado) {
            arrastado.classList.remove('arrastando');
            arrastado = null;
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        if (!arrastado) return;

        const dropTarget = e.target.closest('.associacao-item.termo') || e.target.closest('.coluna-definicoes');

        if (!dropTarget) return;

        if (dropTarget.classList.contains('termo')) {
            if (!dropTarget.querySelector('.definicao')) {
                dropTarget.appendChild(arrastado);
                arrastado.style.position = 'static';
            } else {
                alert('Este termo já possui uma definição associada.');
            }
        } else if (dropTarget.classList.contains('coluna-definicoes')) {
            dropTarget.appendChild(arrastado);
            arrastado.style.position = 'static';
        }
    }

    // Substitua sua função verificarAssociacao por esta versão corrigida

    function verificarAssociacao() {
        associacoesCorretas = 0;
        const termos = colunaTermosEl.querySelectorAll('.associacao-item.termo');

        termos.forEach(termoEl => {
            const definicaoAssociadaEl = termoEl.querySelector('.definicao');
            if (definicaoAssociadaEl) {
                const termoId = termoEl.dataset.id;
                const definicaoId = definicaoAssociadaEl.dataset.id;

                if (termoId === definicaoId) {
                    // tocarSom(somAcerto); // <<-- LINHA REMOVIDA
                    definicaoAssociadaEl.classList.remove('incorreto');
                    definicaoAssociadaEl.classList.add('correto');
                    associacoesCorretas++;
                } else {
                    // tocarSom(somErro); // <<-- LINHA REMOVIDA
                    definicaoAssociadaEl.classList.remove('correto');
                    definicaoAssociadaEl.classList.add('incorreto');
                }
            }
        });

        // --- LÓGICA DE SOM ADICIONADA AQUI ---
        // Toca um único som com base no resultado geral
        if (associacoesCorretas === termos.length) {
            // Se acertou tudo, toca o som de vitória
            tocarSom(somFinal);
        } else if (associacoesCorretas === 0) {
            // Se errou tudo, toca o som de erro
            tocarSom(somErro);
        } else {
            // Se acertou alguns, toca um som de acerto como feedback positivo
            tocarSom(somAcerto);
        }
        // --- FIM DA LÓGICA DE SOM ---

        acertosAssociacaoEl.textContent = associacoesCorretas;
        totalParesAssociacaoEl.textContent = termosDoJogo.length;
        resultadoAssociacaoEl.style.display = 'block';
        botoesFinalAssociacao.style.display = 'flex';
    }

    // Inicializa o jogo quando a página carrega
    carregarJogo();
})();