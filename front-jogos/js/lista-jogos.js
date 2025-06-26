document.addEventListener('DOMContentLoaded', () => {
    const listaJogosDiv = document.getElementById('listaJogos');

    async function carregarJogosPadrao() {
        try {
            // Usamos a nossa nova rota da API
            const res = await fetch('http://localhost:3000/api/jogos/default');
            
            if (!res.ok) {
                throw new Error('Não foi possível carregar os jogos.');
            }

            const jogos = await res.json();

            if (jogos.length === 0) {
                listaJogosDiv.innerHTML = '<p>Nenhum jogo em destaque disponível no momento.</p>';
                return;
            }

            // Limpa a mensagem "Carregando..."
            listaJogosDiv.innerHTML = ''; 

            jogos.forEach(jogo => {
                const card = document.createElement('div');
                card.className = 'card-jogo';
                card.innerHTML = `
                    <div class="info-jogo">
                        <h3>${jogo.nome}</h3>
                        <p><strong>Tipo:</strong> ${jogo.tipo}</p>
                        <p><strong>Termos:</strong> ${jogo.termos.length} pares</p>
                    </div>
                    <div class="acoes-jogo">
                        <a href="jogar.html?id=${jogo._id}" class="btn-jogar" style="text-decoration:none; text-align:center; color:white ; background-color: #007BFF; padding: 10px; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; display: inline-block; margin-right: 10px;">🎮 Jogar Agora</a>
                    </div>
                `;
                listaJogosDiv.appendChild(card);
            });

        } catch (error) {
            listaJogosDiv.innerHTML = `<p class="erro">${error.message}</p>`;
        }
    }

    carregarJogosPadrao();
});