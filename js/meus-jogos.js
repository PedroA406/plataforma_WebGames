const listaJogos = document.getElementById('listaJogos');
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

// ... (código existente no início do arquivo)

async function carregarJogos() {
  try {
    const res = await fetch('http://localhost:3000/api/jogos', {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Erro ao carregar jogos');

    const jogos = await res.json();

    if (jogos.length === 0) {
      listaJogos.innerHTML = '<p>Você ainda não criou nenhum jogo.</p>';
      return;
    }

    listaJogos.innerHTML = jogos.map(j => `
      <div class="card-jogo" data-id="${j._id}">
        <div class="info-jogo">
          <h3>${j.nome}</h3>
          <p><strong>Tipo:</strong> ${j.tipo}</p>
          <p><strong>Código:</strong> <span class="codigo">${j.codigoAcesso || 'N/A'}</span></p>
        </div>
        <div class="acoes-jogo">
          <button class="btn-jogar" data-id="${j._id}">Jogar</button>
          <button class="btn-ranking" data-id="${j._id}">🏆 Ranking</button>
          <button class="btn-compartilhar">🔗 Compartilhar</button>
        </div>
        </div>
    `).join('');

    // Adiciona evento para os botões JOGAR
    document.querySelectorAll('.btn-jogar').forEach(btn => {
      btn.onclick = () => window.location.href = `jogar.html?id=${btn.dataset.id}`;
    });

    // --- NOVO EVENTO PARA O BOTÃO RANKING ---
    document.querySelectorAll('.btn-ranking').forEach(btn => {
        btn.onclick = () => window.location.href = `ranking.html?id=${btn.dataset.id}`;
    });

    // ... (resto dos eventos de compartilhar e copiar igual) ...

  } catch (err) {
    listaJogos.innerHTML = `<p class="erro">${err.message}</p>`;
  }
}
carregarJogos();
// ... (logout igual)

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});
