// pegar token e nome usuario
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

const listaTermosDiv = document.getElementById('listaTermos');
const mensagemJogo = document.getElementById('mensagemJogo');
const formCriarJogo = document.getElementById('formCriarJogo');

// Função para carregar termos do usuário para selecionar
async function carregarTermos() {
  try {
    const res = await fetch('http://localhost:3000/api/termos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar termos');

    const termos = await res.json();

    if (termos.length === 0) {
      listaTermosDiv.innerHTML = '<p>Você não tem termos cadastrados. Vá criar termos primeiro.</p>';
      return;
    }

    listaTermosDiv.innerHTML = termos
      .map(
        termo =>
          `<div class="termo-card"><input type="checkbox" name="termos" value="${termo._id}"/> ${termo.termo} - ${termo.definicao}</div>`
      )
      .join('');
  } catch (err) {
    listaTermosDiv.innerHTML = `<p>Erro ao carregar termos.</p>`;
  }
}

// Chama a função para carregar termos assim que carregar a página
carregarTermos();

// Enviar o formulário para criar jogo
formCriarJogo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nomeJogo').value.trim();
  const tipo = document.getElementById('tipoJogo').value;

  const checkboxes = document.querySelectorAll('input[name="termos"]:checked');
  const termosSelecionados = Array.from(checkboxes).map(cb => cb.value);

  if (termosSelecionados.length === 0) {
    mensagemJogo.style.color = 'red';
    mensagemJogo.textContent = 'Selecione pelo menos um termo.';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/jogos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nome, termos: termosSelecionados, tipo })
    });

    const data = await res.json();

    if (!res.ok) {
      mensagemJogo.style.color = 'red';
      mensagemJogo.textContent = data.erro || 'Erro ao criar jogo.';
      return;
    }

    mensagemJogo.style.color = 'green';
    mensagemJogo.textContent = 'Jogo criado com sucesso!';
    formCriarJogo.reset();

  } catch (error) {
    mensagemJogo.style.color = 'red';
    mensagemJogo.textContent = 'Erro na comunicação com o servidor.';
  }
});
