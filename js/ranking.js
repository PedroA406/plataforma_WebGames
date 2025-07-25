(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const jogoId = urlParams.get('id');

  const tituloJogoEl = document.getElementById('tituloJogo');
  const rankingListEl = document.getElementById('rankingList');

  if (!jogoId) {
    tituloJogoEl.textContent = 'Erro';
    rankingListEl.innerHTML = '<p>ID do jogo não fornecido.</p>';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/jogos/${jogoId}/ranking`);
    if (!res.ok) {
      throw new Error('Não foi possível carregar o ranking.');
    }

    const data = await res.json();
    tituloJogoEl.textContent = `Ranking: ${data.nomeDoJogo}`;

    if (data.ranking.length === 0) {
      rankingListEl.innerHTML = '<p>Ainda não há pontuações registradas para este jogo.</p>';
      return;
    }

    // Cria o HTML para cada item do ranking
    rankingListEl.innerHTML = data.ranking.map((item, index) => {
        let medalha = '';
        if (index === 0) medalha = '🏆';
        if (index === 1) medalha = '🥈';
        if (index === 2) medalha = '🥉';

        return `
            <div class="ranking-item">
                <span class="ranking-posicao">${index + 1} ${medalha}</span>
                <span class="ranking-nome">${item.nomeJogador}</span>
                <span class="ranking-pontuacao">${item.pontuacao} pts</span>
                <span class="ranking-tempo">${item.tempo}s</span>
            </div>
        `;
    }).join('');

  } catch (error) {
    tituloJogoEl.textContent = 'Erro ao Carregar';
    rankingListEl.innerHTML = `<p style="color: red;">${error.message}</p>`;
  }
})();