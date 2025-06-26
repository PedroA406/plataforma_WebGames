const listaJogos = document.getElementById('listaJogos');
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

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
          <p><strong>Termos:</strong> ${j.termos.map(t => t.termo).join(', ')}</p>
          <p><strong>Código:</strong> <span class="codigo">${j.codigoAcesso || 'N/A'}</span></p>
        </div>
        <div class="acoes-jogo">
          <button class="btn-jogar" data-id="${j._id}">Jogar</button>
          <button class="btn-compartilhar">🔗 Compartilhar</button>
        </div>
        <div class="compartilhar-painel" style="display:none;">
          <p><strong>Link:</strong> <a href="${window.location.origin}/jogar.html?id=${j._id}" target="_blank" class="link-jogo">${window.location.origin}/jogar.html?id=${j._id}</a></p>
          <p><strong>Código:</strong> <span class="codigo-texto">${j.codigoAcesso || 'N/A'}</span></p>
          <div class="botoes-copiar">
            <button class="btn-copiar" data-text="${window.location.origin}/jogar.html?id=${j._id}">Copiar Link</button>
            <button class="btn-copiar" data-text="${j.codigoAcesso || ''}">Copiar Código</button>
          </div>
        </div>
      </div>
    `).join('');

    // Botão Jogar
    document.querySelectorAll('.btn-jogar').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        window.location.href = `jogar.html?id=${id}`;
      };
    });

    // Mostrar/Ocultar painel Compartilhar
    document.querySelectorAll('.btn-compartilhar').forEach(btn => {
      btn.onclick = () => {
        const card = btn.closest('.card-jogo');
        const painel = card.querySelector('.compartilhar-painel');
        const isVisivel = painel.style.display === 'block';
        // Fecha todos os painéis abertos antes
        document.querySelectorAll('.compartilhar-painel').forEach(p => p.style.display = 'none');
        // Abre ou fecha o atual
        painel.style.display = isVisivel ? 'none' : 'block';
      };
    });

    // Botões copiar (link e código)
    document.querySelectorAll('.btn-copiar').forEach(btn => {
      btn.onclick = () => {
        const texto = btn.dataset.text;
        navigator.clipboard.writeText(texto).then(() => {
          btn.textContent = 'Copiado!';
          setTimeout(() => btn.textContent = btn.classList.contains('btn-copiar') && btn.dataset.text === texto ? 
            (texto.includes('http') ? 'Copiar Link' : 'Copiar Código') : btn.textContent, 1500);
        }).catch(() => {
          alert('Erro ao copiar');
        });
      };
    });

  } catch (err) {
    listaJogos.innerHTML = `<p class="erro">${err.message}</p>`;
  }
}

carregarJogos();

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});
