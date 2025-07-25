(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const jogoId = urlParams.get('id');
    const token = localStorage.getItem('token'); 

    const tituloJogo = document.getElementById('tituloJogo');
    const areaJogo = document.getElementById('areaJogo');

    // --- ELEMENTOS DO PLACAR ---
    const scoreDisplay = document.getElementById('scoreDisplay');
    const timerDisplay = document.getElementById('timerDisplay');

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

    // Elementos Memória
    const jogoMemoriaEl = document.getElementById('jogoMemoria');
    const memoriaGridEl = document.getElementById('memoriaGrid');
    const resultadoMemoriaEl = document.getElementById('resultadoMemoria');
    const btnJogarNovamenteMemoria = document.getElementById('btnJogarNovamenteMemoria');

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

    // Elementos Verdadeiro ou Falso (novos)
    const jogoVFEl = document.getElementById('jogoVerdadeiroFalso');
    const perguntaVFEl = document.getElementById('perguntaVerdadeiroFalso');
    const btnVerdadeiro = document.getElementById('btnVerdadeiro');
    const btnFalso = document.getElementById('btnFalso');
    const resultadoFinalVF = document.getElementById('resultadoFinalVerdadeiroFalso');
    const acertosVFEl = document.getElementById('acertosVerdadeiroFalso');
    const totalPerguntasVFEl = document.getElementById('totalPerguntasVerdadeiroFalso');
    const botoesFinalVF = document.getElementById('botoesFinalVerdadeiroFalso');
    const btnJogarNovamenteVF = document.getElementById('btnJogarNovamenteVerdadeiroFalso');

    const somClick = new Audio('sounds/click.mp3');
    const somAcerto = new Audio('sounds/acerto.mp3');
    const somErro = new Audio('sounds/erro.mp3');
    const somFinal = new Audio('sounds/final.mp3');
    
    function tocarSom(som) {
        const somClone = som.cloneNode();
        somClone.play();
    }

    let termosDoJogo = [];

    // --- LÓGICA DE TEMPO E PONTUAÇÃO ---
    let timerInterval;
    let startTime;
    let pontuacaoAtual = 0;

    function iniciarTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const tempoDecorrido = Math.floor((Date.now() - startTime) / 1000);
            timerDisplay.innerHTML = `<strong>Tempo:</strong> ${tempoDecorrido}s`;
        }, 1000);
    }
    function pararTimer() { clearInterval(timerInterval); }
    function getTempoDecorrido() { return Math.floor((Date.now() - startTime) / 1000); }
    function atualizarPontuacao(pontos) {
        pontuacaoAtual += pontos;
        scoreDisplay.innerHTML = `<strong>Pontuação:</strong> ${pontuacaoAtual}`;
    }
    function resetarPlacar() {
        pontuacaoAtual = 0;
        scoreDisplay.innerHTML = `<strong>Pontuação:</strong> 0`;
        timerDisplay.innerHTML = `<strong>Tempo:</strong> 0s`;
        pararTimer();
    }
    
    // --- FUNÇÃO PARA SALVAR O RESULTADO ---
    async function salvarResultado(pontuacaoFinal, tempoFinal) {
        if (!token) { return; }
        try {
            await fetch(`http://localhost:3000/api/jogos/${jogoId}/registrar-pontuacao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pontuacao: pontuacaoFinal, tempo: tempoFinal })
            });
        } catch (error) { console.error("Erro ao salvar pontuação:", error); }
    }

    if (!jogoId) {
        areaJogo.innerHTML = '<p>ID do jogo não fornecido.</p>';
        return;
    }
    
    async function carregarJogo() {
        try {
            const res = await fetch(`http://localhost:3000/api/jogos/publico/${jogoId}`);
            if (!res.ok) throw new Error('Erro ao carregar jogo');
            const jogo = await res.json();

            tituloJogo.textContent = jogo.nome;
            termosDoJogo = jogo.termos || [];

            if (termosDoJogo.length === 0) {
                areaJogo.innerHTML = '<p>Este jogo não possui termos cadastrados.</p>';
                return;
            }
            
            document.querySelectorAll('.jogo-tipo').forEach(el => el.style.display = 'none');
            
            switch (jogo.tipo) {
                case 'quiz': 
                    jogoQuizEl.style.display = 'block';
                    iniciarQuiz(); 
                    break;
                case 'memoria': 
                    jogoMemoriaEl.style.display = 'block';
                    iniciarMemoria(); 
                    break;
                case 'associacao': 
                    jogoAssociacaoEl.style.display = 'block';
                    iniciarAssociacao(); 
                    break;
                case 'verdadeiroFalso':
                    jogoVFEl.style.display = 'block';
                    iniciarVerdadeiroFalso();
                    break;
                default:
                    areaJogo.innerHTML = `<p>Tipo de jogo "${jogo.tipo}" não suportado.</p>`;
            }
        } catch (error) {
            tituloJogo.textContent = 'Erro ao carregar jogo';
            areaJogo.innerHTML = `<p style="color:red;">${error.message}</p>`;
        }
    }

    // ================== QUIZ ====================
    let indiceQuiz = 0;
    let acertosQuiz = 0;

    function iniciarQuiz() {
        resetarPlacar();
        iniciarTimer();
        indiceQuiz = 0;
        acertosQuiz = 0;
        resultadoFinalQuiz.style.display = 'none';
        botoesFinalQuiz.style.display = 'none';
        
        mostrarPerguntaQuiz();

        btnProximoQuiz.onclick = () => {
            tocarSom(somClick);
            indiceQuiz++;
            if (indiceQuiz < termosDoJogo.length) {
                mostrarPerguntaQuiz();
            } else {
                finalizarQuiz();
            }
        };

        btnJogarNovamenteQuiz.onclick = () => iniciarQuiz();
    }

    function mostrarPerguntaQuiz() {
        const termoAtual = termosDoJogo[indiceQuiz];
        perguntaQuizEl.textContent = `Qual a definição de "${termoAtual.termo}"?`;
        respostasQuizEl.innerHTML = '';
        let opcoes = [termoAtual.definicao];
        const outrasDefinicoes = termosDoJogo.filter(t => t._id !== termoAtual._id).map(t => t.definicao);
        while (opcoes.length < Math.min(4, termosDoJogo.length) && outrasDefinicoes.length > 0) {
            const randomIndex = Math.floor(Math.random() * outrasDefinicoes.length);
            opcoes.push(outrasDefinicoes.splice(randomIndex, 1)[0]);
        }
        opcoes.sort(() => Math.random() - 0.5);
        opcoes.forEach(opcao => {
            const btn = document.createElement('button');
            btn.classList.add('resposta-btn');
            btn.textContent = opcao;
            btn.onclick = () => {
                tocarSom(somClick);
                if (opcao === termoAtual.definicao) {
                    tocarSom(somAcerto);
                    btn.classList.add('correta');
                    acertosQuiz++;
                    atualizarPontuacao(10);
                } else {
                    tocarSom(somErro);
                    btn.classList.add('errada');
                }
                [...respostasQuizEl.children].forEach(b => {
                    if (b.textContent === termoAtual.definicao) b.classList.add('correta');
                    b.disabled = true;
                });
                btnProximoQuiz.style.display = 'inline-block';
            };
            respostasQuizEl.appendChild(btn);
        });
        btnProximoQuiz.style.display = 'none';
    }

    function finalizarQuiz() {
        pararTimer();
        tocarSom(somFinal);
        btnProximoQuiz.style.display = 'none';

        const tempoFinal = getTempoDecorrido();
        salvarResultado(pontuacaoAtual, tempoFinal);

        acertosQuizEl.textContent = acertosQuiz;
        totalPerguntasQuizEl.textContent = termosDoJogo.length;
        resultadoFinalQuiz.style.display = 'block';
        botoesFinalQuiz.style.display = 'flex';
    }
    
    // ================== MEMÓRIA ====================
    let cardsVirados = [];
    let paresEncontrados = 0;
    let bloqueadoMemoria = false;
    function iniciarMemoria() {
        resetarPlacar();
        iniciarTimer();
        memoriaGridEl.innerHTML = '';
        cardsVirados = [];
        paresEncontrados = 0;
        bloqueadoMemoria = false;
        resultadoMemoriaEl.style.display = 'none';
        memoriaGridEl.style.display = 'grid';
        let cardsMemoria = [];
        termosDoJogo.forEach(termo => {
            cardsMemoria.push({ id: termo._id, conteudo: termo.termo });
            cardsMemoria.push({ id: termo._id, conteudo: termo.definicao });
        });
        cardsMemoria.sort(() => Math.random() - 0.5);
        cardsMemoria.forEach((card) => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('memoria-card');
            cardEl.dataset.id = card.id;
            cardEl.innerHTML = `<div class="memoria-card-frente"></div><div class="memoria-card-verso">${card.conteudo}</div>`;
            cardEl.addEventListener('click', () => virarCard(cardEl));
            memoriaGridEl.appendChild(cardEl);
        });
        btnJogarNovamenteMemoria.onclick = iniciarMemoria;
    }
    function virarCard(cardEl) {
        if (bloqueadoMemoria || cardEl.classList.contains('virado')) return;
        tocarSom(somClick);
        cardEl.classList.add('virado');
        cardsVirados.push(cardEl);
        if (cardsVirados.length === 2) {
            bloqueadoMemoria = true;
            setTimeout(verificarParMemoria, 800);
        }
    }
    function verificarParMemoria() {
        const [card1, card2] = cardsVirados;
        if (card1.dataset.id === card2.dataset.id) {
            tocarSom(somAcerto);
            card1.classList.add('encontrado');
            card2.classList.add('encontrado');
            paresEncontrados++;
            if (paresEncontrados === termosDoJogo.length) {
                finalizarMemoria();
            }
        } else {
            tocarSom(somErro);
            card1.classList.remove('virado');
            card2.classList.remove('virado');
        }
        cardsVirados = [];
        bloqueadoMemoria = false;
    }
    function finalizarMemoria() {
        pararTimer();
        tocarSom(somFinal);
        const tempoFinal = getTempoDecorrido();
        const pontuacaoFinal = Math.max(10, 100 - tempoFinal);
        atualizarPontuacao(pontuacaoFinal);
        salvarResultado(pontuacaoAtual, tempoFinal);
        memoriaGridEl.style.display = 'none';
        resultadoMemoriaEl.style.display = 'block';
    }
    // ================== ASSOCIAÇÃO ====================
    let arrastado = null;
    function iniciarAssociacao() {
        resetarPlacar();
        iniciarTimer();
        colunaTermosEl.innerHTML = '<h3>Termos</h3>';
        colunaDefinicoesEl.innerHTML = '<h3>Definições</h3>';
        btnVerificarAssociacao.style.display = 'block';
        resultadoAssociacaoEl.style.display = 'none';
        botoesFinalAssociacao.style.display = 'none';
        const termos = [...termosDoJogo];
        const definicoes = [...termosDoJogo].sort(() => Math.random() - 0.5);
        termos.forEach(t => {
            const termoEl = document.createElement('div');
            termoEl.classList.add('associacao-item', 'termo');
            termoEl.dataset.id = t._id;
            termoEl.textContent = t.termo;
            termoEl.addEventListener('dragover', e => e.preventDefault());
            termoEl.addEventListener('drop', handleDrop);
            colunaTermosEl.appendChild(termoEl);
        });
        definicoes.forEach(d => {
            const defEl = document.createElement('div');
            defEl.classList.add('associacao-item', 'definicao');
            defEl.dataset.id = d._id;
            defEl.textContent = d.definicao;
            defEl.draggable = true;
            defEl.addEventListener('dragstart', handleDragStart);
            colunaDefinicoesEl.appendChild(defEl);
        });
        btnVerificarAssociacao.onclick = () => {
            tocarSom(somClick);
            verificarAssociacao();
        };
        btnJogarNovamenteAssociacao.onclick = iniciarAssociacao;
    }
    function handleDragStart(e) { arrastado = e.target; }
    function handleDrop(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('.termo');
        if (dropTarget && !dropTarget.querySelector('.definicao')) {
            dropTarget.appendChild(arrastado);
        }
    }
    function verificarAssociacao() {
        pararTimer();
        tocarSom(somFinal);
        let acertos = 0;
        const termos = colunaTermosEl.querySelectorAll('.termo');
        termos.forEach(termoEl => {
            const defEl = termoEl.querySelector('.definicao');
            if (defEl) {
                if (termoEl.dataset.id === defEl.dataset.id) {
                    defEl.classList.add('correto');
                    acertos++;
                    atualizarPontuacao(10);
                } else {
                    defEl.classList.add('incorreto');
                }
            }
        });
        const tempoFinal = getTempoDecorrido();
        salvarResultado(pontuacaoAtual, tempoFinal);
        acertosAssociacaoEl.textContent = acertos;
        totalParesAssociacaoEl.textContent = termosDoJogo.length;
        resultadoAssociacaoEl.style.display = 'block';
        botoesFinalAssociacao.style.display = 'flex';
        btnVerificarAssociacao.style.display = 'none';
    }

    // ================== VERDADEIRO OU FALSO ====================
    let indiceVF = 0;
    let acertosVF = 0;

    function iniciarVerdadeiroFalso() {
        resetarPlacar();
        iniciarTimer();
        indiceVF = 0;
        acertosVF = 0;
        resultadoFinalVF.style.display = 'none';
        botoesFinalVF.style.display = 'none';

        mostrarPerguntaVF();

        btnVerdadeiro.onclick = () => responderVF(true);
        btnFalso.onclick = () => responderVF(false);

        btnJogarNovamenteVF.onclick = iniciarVerdadeiroFalso;
    }

    function mostrarPerguntaVF() {
        if (indiceVF >= termosDoJogo.length) {
            finalizarVerdadeiroFalso();
            return;
        }

        const termoAtual = termosDoJogo[indiceVF];

        // Decidir aleatoriamente se vai mostrar a definição correta ou uma incorreta para o jogo VF
        const mostrarDefinicaoCorreta = Math.random() < 0.5;

        let definicaoParaMostrar;
        if (mostrarDefinicaoCorreta) {
            definicaoParaMostrar = termoAtual.definicao;
            termoAtual._vfCorreta = true;
        } else {
            // Pegar uma definição incorreta aleatória de outro termo
            const outrasDefinicoes = termosDoJogo
                .filter(t => t._id !== termoAtual._id)
                .map(t => t.definicao);
            definicaoParaMostrar = outrasDefinicoes.length > 0
                ? outrasDefinicoes[Math.floor(Math.random() * outrasDefinicoes.length)]
                : termoAtual.definicao; // fallback para correta se não tem outras
            termoAtual._vfCorreta = false;
        }

        perguntaVFEl.textContent = `O termo "${termoAtual.termo}" tem a seguinte definição:\n"${definicaoParaMostrar}". Esta afirmação é verdadeira ou falsa?`;
    }

    function responderVF(respostaUsuario) {
        tocarSom(somClick);
        const termoAtual = termosDoJogo[indiceVF];

        if (respostaUsuario === termoAtual._vfCorreta) {
            tocarSom(somAcerto);
            atualizarPontuacao(10);
            acertosVF++;
        } else {
            tocarSom(somErro);
        }

        indiceVF++;
        mostrarPerguntaVF();
    }

    function finalizarVerdadeiroFalso() {
        pararTimer();
        tocarSom(somFinal);
        const tempoFinal = getTempoDecorrido();
        salvarResultado(pontuacaoAtual, tempoFinal);

        acertosVFEl.textContent = acertosVF;
        totalPerguntasVFEl.textContent = termosDoJogo.length;
        resultadoFinalVF.style.display = 'block';
        botoesFinalVF.style.display = 'flex';
    }

    // Inicializa o jogo
    carregarJogo();
})();
